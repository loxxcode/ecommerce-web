import express from 'express';
import { body, validationResult } from 'express-validator';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get user's wishlist
router.get('/', authenticate, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('items.product', 'name price images thumbnail seller status rating')
      .populate('items.product.seller', 'name storeName');

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, items: [] });
      await wishlist.save();
    }

    // Filter out unavailable products
    wishlist.items = wishlist.items.filter(item => 
      item.product && item.product.status === 'active'
    );

    await wishlist.save();

    res.json({ wishlist });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to wishlist
router.post('/add', authenticate, [
  body('productId').isMongoId().withMessage('Invalid product ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId } = req.body;

    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status !== 'active') {
      return res.status(400).json({ message: 'Product is not available' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, items: [] });
    }

    // Check if product already in wishlist
    if (wishlist.hasProduct(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    wishlist.addProduct(productId);
    await wishlist.save();

    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('items.product', 'name price images thumbnail seller rating')
      .populate('items.product.seller', 'name storeName');

    res.status(201).json({
      message: 'Product added to wishlist successfully',
      wishlist: populatedWishlist
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from wishlist
router.delete('/remove/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    if (!wishlist.removeProduct(productId)) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    await wishlist.save();

    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('items.product', 'name price images thumbnail seller rating')
      .populate('items.product.seller', 'name storeName');

    res.json({
      message: 'Product removed from wishlist successfully',
      wishlist: populatedWishlist
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    const inWishlist = wishlist ? wishlist.hasProduct(productId) : false;

    res.json({ inWishlist });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear wishlist
router.delete('/clear', authenticate, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({ message: 'Wishlist cleared successfully' });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Move item from wishlist to cart
router.post('/move-to-cart/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status !== 'active') {
      return res.status(400).json({ message: 'Product is not available' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Remove from wishlist
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.removeProduct(productId);
      await wishlist.save();
    }

    // Add to cart (import Cart model)
    const Cart = (await import('../models/Cart.js')).default;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ message: 'Insufficient stock for requested quantity' });
      }
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity
      });
    }

    await cart.save();

    res.json({ 
      message: 'Product moved to cart successfully',
      movedToCart: true
    });
  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
