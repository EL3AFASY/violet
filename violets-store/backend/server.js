const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

dotenv.config()

const app = express()

/* ---------------- SECURITY ---------------- */

// Helmet (secure headers)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
)

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, try again later.' }
})

app.use(limiter)

/* ---------------- MIDDLEWARE ---------------- */

app.use(cors({
  origin:
    process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : 'http://localhost:5500',
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

/* ---------------- ROUTES ---------------- */

const safeRoute = (routePath) => {
  try {
    return require(routePath)
  } catch (err) {
    console.error(`Route load error: ${routePath}`, err)
    return (req, res) =>
      res.status(500).json({ error: 'Route failed to load' })
  }
}

app.use('/api/auth', safeRoute('./routes/auth'))
app.use('/api/products', safeRoute('./routes/products'))
app.use('/api/orders', safeRoute('./routes/orders'))
app.use('/api/admin', safeRoute('./routes/admin'))
app.use('/api/tracking', safeRoute('./routes/tracking'))

/* ---------------- HEALTH CHECK ---------------- */

app.get('/api', (req, res) => {
  res.json({ message: "Violet's Backend API v2.0 🛍️" })
})

/* ---------------- DEV SEED (SAFE) ---------------- */

if (process.env.NODE_ENV !== 'production') {
  app.get('/api/seed-run', async (req, res) => {
    const Product = require('./models/Product')
    const count = await Product.countDocuments()
    res.json({ message: `Products in DB: ${count}` })
  })
}

/* ---------------- MONGO DB ---------------- */

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected - Violet DB'))
.catch(err => console.error('❌ MongoDB Error:', err))

/* ---------------- ERROR HANDLER ---------------- */

const errorHandler = require('./middleware/errorHandler')
app.use(errorHandler)

/* ---------------- GLOBAL CRASH SAFETY ---------------- */

process.on('unhandledRejection', (err) => {
  console.error('⚠️ Unhandled Rejection:', err)
})

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err)
})

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})