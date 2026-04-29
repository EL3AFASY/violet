const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// GET /api/tracking/order/:id - Customer track
router.get('/order/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
      .populate('items.product', 'name images finalPrice');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Track error' });
  }
});

// PUT /api/admin/orders/:id/tracking - Admin update
router.put('/orders/:id/tracking', auth, admin, async (req, res) => {
  try {
    const { status, message, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status) {
      order.trackingTimeline.push({ status, message, date: new Date() });
      order.status = status;
    }
    if (req.body.deliveryEstimate) order.deliveryEstimate = new Date(req.body.deliveryEstimate);
    if (req.body.courierName) order.courierName = req.body.courierName;

    await order.save();
    await order.populate('items.product');
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
