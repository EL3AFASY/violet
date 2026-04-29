const mongoose = require('mongoose');
const Product = require('./models/Product');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Seeding products...');
    
    // Clear existing
    await Product.deleteMany({});
    
    const sampleProducts = [
      {
        name: "Violet Luxury Tote",
        description: "Premium Italian leather tote with gold hardware. Timeless elegance.",
        images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"],
        category: "bags",
        price: 299,
        discount: 15,
        stock: 50
      },
      {
        name: "Purple Crossbody Bag",
        description: "Compact crossbody in signature violet shade. Perfect for everyday.",
        images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"],
        category: "bags",
        price: 179,
        discount: 20,
        stock: 30
      },
      {
        name: "Silk Scarf Accessory",
        description: "Hand-printed silk scarf with floral violet pattern.",
        images: ["https://images.unsplash.com/photo-1581235694617-349770ee4689?w=500"],
        category: "accessories",
        price: 89,
        discount: 10,
        stock: 100
      }
      // Add 5 more similar...
    ];

    await Product.insertMany(sampleProducts);
    console.log('✅ Seed complete! Check http://localhost:5000/api/products');
    process.exit(0);
  })
  .catch(err => console.error(err));
