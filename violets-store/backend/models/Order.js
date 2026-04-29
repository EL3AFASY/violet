const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
  }],
  totalPrice: { type: Number, required: true },
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'stripe', 'vodafone_cash', 'instapay'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'approved'],
    default: 'pending'
  },
  paymentId: String,
  senderPhone: String, // Vodafone
  transactionId: String,
  paymentScreenshot: String, // Cloudinary URL
  status: { 
    type: String, 
    enum: ['pending', 'payment_pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  trackingNumber: String,
  trackingTimeline: [{
    status: String,
    message: String,
    date: { type: Date, default: Date.now }
  }],
  deliveryEstimate: Date,
  courierName: String,
  courierNotes: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
