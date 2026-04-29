const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// @route GET /api/admin/stats
// @desc Admin dashboard stats
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const pipeline = [
      { $match: {
        $or: [
          { paymentStatus: 'paid', status: { $ne: 'cancelled' } },
          { paymentMethod: 'cod', status: 'delivered' }
        ]
      }},
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ];
    const revenueResult = await Order.aggregate(pipeline);
    
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 365*24*60*60*1000) } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' }
      }},
      { $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }},
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    const [productCount, orderCount, pendingPayments] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: { $in: ['pending', 'failed'] } })
    ]);

    res.json({
      products: productCount,
      orders: orderCount,
      pendingPayments,
      revenue: revenueResult[0]?.totalRevenue || 0,
      monthlyRevenue,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ error: 'Stats error' });
  }
});

module.exports = router;
