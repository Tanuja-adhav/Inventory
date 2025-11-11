const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Product = require('../models/Product');

// Add to wishlist
router.post('/add/:productId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const productId = req.params.productId;
    if (!productId) return res.status(400).json({ message: 'Product id required' });
    if (user.wishlist.map(id => id.toString()).includes(productId)) {
      return res.status(400).json({ message: 'Already in wishlist' });
    }
    user.wishlist.push(productId);
    await user.save();
    const wishlist = await User.findById(req.user.id).populate('wishlist');
    res.json(wishlist.wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Remove from wishlist
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(pid => pid.toString() !== req.params.productId);
    await user.save();
    const wishlist = await User.findById(req.user.id).populate('wishlist');
    res.json(wishlist.wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get wishlist
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.json(user.wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
