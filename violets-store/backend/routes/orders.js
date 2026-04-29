const express = require('express');
const { body } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// @route   POST api/orders
// @desc    Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = 'cod' } = req.body;

    // Validate stock
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product?.name}` });
      }
    }

    let order = new Order({
      user: req.user.id,
      items,
      totalPrice: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'paid' : 'pending',
      senderPhone: req.body.senderPhone,
      transactionId: req.body.transactionId,
      paymentScreenshot: req.body.paymentScreenshot
    });

    await order.save();

    // Update stock
    for (let item of items) {
      await Product.findByIdAndUpdate(item.product, { 
        $inc: { stock: -item.quantity } 
      });
    }

    if (paymentMethod === 'stripe') {
      const stripe = require('../config/stripe');
      if (stripe && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here') {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: items.map(item => ({
            price_data: {
              currency: 'usd',
              product_data: { name: "Violet's Order" },
              unit_amount: Math.round(item.price * 100 * item.quantity),
            },
            quantity: 1,
          })),
          mode: 'payment',
          success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart?success=true`,
          cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart?cancel=true`,
          metadata: { orderId: order._id.toString() }
        });
        order.paymentId = session.id;
        await order.save();
        return res.json({ ...order.toObject(), checkoutUrl: session.url });
      }
    }

    await order.populate(['user', 'items.product']);
    
    // Send email
    require('../utils/email').sendOrderConfirmation(order);
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/orders/my
// @desc    Get user orders
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/orders
// @desc    Get all orders (admin)
router.get('/', auth, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT api/orders/:id
// @desc    Update order status (admin)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('items.product');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
