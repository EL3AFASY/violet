const express = require('express')
const multer = require('multer')
const { body, validationResult } = require('express-validator')
const Product = require('../models/Product')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const cloudinary = require('../config/cloudinary')

const router = express.Router()

const upload = multer({ dest: 'uploads/' })

/* ---------------- CLOUDINARY UPLOAD ---------------- */

const handleUpload = async (req, res, next) => {
  try {
    if (!req.file) return next()

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
      const result = await cloudinary.uploader.upload(req.file.path)

      req.body.images = req.body.images
        ? JSON.parse(req.body.images).concat(result.secure_url)
        : [result.secure_url]
    } else {
      req.body.images = [req.file.path]
    }

    next()
  } catch (err) {
    return res.status(400).json({ error: 'Image upload failed' })
  }
}

/* ---------------- GET ALL ---------------- */

router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query
    let query = {}

    if (category) query.category = category
    if (search) query.name = { $regex: search, $options: 'i' }

    const products = await Product.find(query).sort({ createdAt: -1 })
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

/* ---------------- GET ONE ---------------- */

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

/* ---------------- CREATE PRODUCT ---------------- */

router.post(
  '/',
  auth,
  admin,
  upload.single('image'),
  handleUpload,
  [
    body('name').trim().notEmpty().escape(),
    body('description').trim().notEmpty().escape(),
    body('category').trim().notEmpty().escape(),
    body('price').isFloat({ min: 0 }),
    body('discount').optional().isInt({ min: 0, max: 100 }),
    body('stock').optional().isInt({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const product = new Product({
        ...req.body,
        images: req.body.images || []
      })

      await product.save()
      res.status(201).json(product)
    } catch (error) {
      res.status(500).json({ error: 'Server error' })
    }
  }
)

/* ---------------- UPDATE PRODUCT ---------------- */

router.put(
  '/:id',
  auth,
  admin,
  upload.single('image'),
  handleUpload,
  async (req, res) => {
    try {
      const existing = await Product.findById(req.params.id)
      if (!existing) {
        return res.status(404).json({ error: 'Product not found' })
      }

      const updates = {
        ...req.body,
        images: req.body.images || existing.images || []
      }

      if (req.file && !process.env.CLOUDINARY_CLOUD_NAME) {
        updates.images.push(req.file.path.replace(/\\/g, '/'))
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      )

      res.json(product)
    } catch (error) {
      res.status(500).json({ error: 'Server error' })
    }
  }
)

/* ---------------- DELETE ---------------- */

router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })

    res.json({ message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router