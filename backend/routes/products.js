const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Product = require('../models/Product');

// Create product
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, quantity, price, category } = req.body;
    const product = new Product({ name, description, quantity, price, category, createdBy: req.user.id });
    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Read all products
router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, quantity, price, category } = req.body;
    const updated = await Product.findByIdAndUpdate(req.params.id,
      { name, description, quantity, price, category },
      { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
