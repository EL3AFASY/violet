const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  images: [{ type: String }], // URLs or paths
  category: { type: String, required: true }, // bags, accessories
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  finalPrice: { type: Number, min: 0 },
  stock: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

// Auto-calculate finalPrice BEFORE save (as required)
productSchema.pre('save', function(next) {
  this.finalPrice = this.price * (1 - this.discount / 100);
  next();
});

module.exports = mongoose.model('Product', productSchema);
