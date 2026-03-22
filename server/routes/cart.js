import express from 'express';
import { body, validationResult } from 'express-validator';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get user's cart
router.get('/', authenticate, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price images thumbnail seller stock status')
      .populate('items.product.seller', 'name storeName');

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }

    // Filter out unavailable products
    cart.items = cart.items.filter(item => 
      item.product && 
      item.product.status === 'active' && 
      item.product.stock > 0
    );

    await cart.save();

    const total = cart.calculateTotal();
    const count = cart.getItemCount();

    res.json({
      cart: {
        ...cart.toObject(),
        total,
        count
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/add', authenticate, [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity = 1 } = req.body;

    // Check if product exists and is available
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

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already exists in cart
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

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images thumbnail seller')
      .populate('items.product.seller', 'name storeName');

    const total = populatedCart.calculateTotal();
    const count = populatedCart.getItemCount();

    res.json({
      message: 'Item added to cart successfully',
      cart: {
        ...populatedCart.toObject(),
        total,
        count
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/update', authenticate, [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartItem = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Check stock
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      return res.status(400).json({ message: 'Product is not available' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    cartItem.quantity = quantity;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images thumbnail seller')
      .populate('items.product.seller', 'name storeName');

    const total = populatedCart.calculateTotal();
    const count = populatedCart.getItemCount();

    res.json({
      message: 'Cart updated successfully',
      cart: {
        ...populatedCart.toObject(),
        total,
        count
      }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/remove/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => 
      item.product.toString() !== productId
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images thumbnail seller')
      .populate('items.product.seller', 'name storeName');

    const total = populatedCart.calculateTotal();
    const count = populatedCart.getItemCount();

    res.json({
      message: 'Item removed from cart successfully',
      cart: {
        ...populatedCart.toObject(),
        total,
        count
      }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/clear', authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cart summary (total and count)
router.get('/summary', authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'price stock status');

    if (!cart) {
      return res.json({ total: 0, count: 0 });
    }

    // Filter out unavailable products
    const availableItems = cart.items.filter(item => 
      item.product && 
      item.product.status === 'active' && 
      item.product.stock > 0
    );

    const total = availableItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
    const count = availableItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({ total, count });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
