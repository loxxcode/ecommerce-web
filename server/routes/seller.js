import express from 'express';
import mongoose from 'mongoose';
import { body, query, validationResult } from 'express-validator';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All seller routes require authentication and seller role
router.use(protect);
router.use(authorize('seller'));

// @route   GET /api/seller/dashboard
// @desc    Get seller dashboard statistics
// @access  Private/Seller
router.get('/dashboard', async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // Get seller's products count
    const totalProducts = await Product.countDocuments({ sellerId });
    
    // Get seller's orders
    const orders = await Order.find({ 'items.sellerId': sellerId });
    const totalOrders = orders.length;
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((total, order) => {
      const sellerItems = order.items.filter(item => item.sellerId.toString() === sellerId.toString());
      return total + sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, 0);
    
    // Calculate conversion rate (orders / unique visitors)
    // For now, using a placeholder calculation
    const conversionRate = totalOrders > 0 ? ((totalOrders / (totalOrders * 10)) * 100).toFixed(1) + '%' : '0%';
    
    // Get growth data (compare with last month)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newProducts = await Product.countDocuments({ 
      sellerId, 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    const recentOrders = await Order.find({ 
      'items.sellerId': sellerId,
      createdAt: { $gte: thirtyDaysAgo } 
    });
    
    const productsGrowth = totalProducts > 0 ? ((newProducts / totalProducts) * 100).toFixed(1) + '%' : '0%';
    const ordersGrowth = totalOrders > 0 ? ((recentOrders.length / totalOrders) * 100).toFixed(1) + '%' : '0%';
    
    // Revenue growth (placeholder)
    const revenueGrowth = '+12% vs last month';
    const conversionGrowth = '+0.5% up';

    res.json({
      totalProducts,
      totalRevenue,
      totalOrders,
      conversionRate,
      productsGrowth,
      revenueGrowth,
      ordersGrowth,
      conversionGrowth
    });
  } catch (error) {
    console.error('Get seller dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/seller/sales
// @desc    Get seller sales data
// @access  Private/Seller
router.get('/sales', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const period = req.query.period || '30d';
    let days = 30;
    
    switch (period) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      case '1y': days = 365; break;
    }

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const sellerId = req.user._id;
    
    // Get seller's orders in the period
    const orders = await Order.find({
      'items.sellerId': sellerId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Group by month for chart data
    const monthlyData = {};
    orders.forEach(order => {
      const month = order.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, revenue: 0, orders: 0 };
      }
      
      const sellerItems = order.items.filter(item => item.sellerId.toString() === sellerId.toString());
      const orderRevenue = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      monthlyData[month].revenue += orderRevenue;
      monthlyData[month].orders += 1;
    });

    const chartData = Object.values(monthlyData);

    res.json({ monthlySales: chartData });
  } catch (error) {
    console.error('Get sales data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/seller/products
// @desc    Get seller's products
// @access  Private/Seller
router.get('/products', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1 }),
  query('status').optional().isIn(['active', 'inactive'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { sellerId: req.user._id };
    if (req.query.status !== undefined) filter.isActive = req.query.status === 'active';

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/seller/orders
// @desc    Get seller's orders
// @access  Private/Seller
router.get('/orders', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1 }),
  query('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { 'items.sellerId': req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const orders = await Order.find(filter)
      .populate('buyerId', 'name email')
      .populate('items.productId', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/seller/analytics
// @desc    Get seller analytics
// @access  Private/Seller
router.get('/analytics', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const period = req.query.period || '30d';
    const sellerId = req.user._id;

    // Get seller's analytics data
    const totalProducts = await Product.countDocuments({ sellerId });
    const totalOrders = await Order.countDocuments({ 'items.sellerId': sellerId });
    
    // Get revenue by status
    const orders = await Order.find({ 'items.sellerId': sellerId });
    const totalRevenue = orders.reduce((total, order) => {
      const sellerItems = order.items.filter(item => item.sellerId.toString() === sellerId.toString());
      return total + sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, 0);

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      period
    });
  } catch (error) {
    console.error('Get seller analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/seller/profile
// @desc    Get seller profile
// @access  Private/Seller
router.get('/profile', async (req, res) => {
  try {
    const seller = await User.findById(req.user._id)
      .select('-password')
      .populate('storeLogo', 'url');

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.json({ seller });
  } catch (error) {
    console.error('Get seller profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/seller/profile
// @desc    Update seller profile
// @access  Private/Seller
router.put('/profile', [
  body('storeName').optional().isString().trim(),
  body('storeDescription').optional().isString().trim(),
  body('phone').optional().isString().trim(),
  body('address').optional().isString().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    if (req.body.storeName) updates.storeName = req.body.storeName;
    if (req.body.storeDescription) updates.storeDescription = req.body.storeDescription;
    if (req.body.phone) updates.phone = req.body.phone;
    if (req.body.address) updates.address = req.body.address;

    const updatedSeller = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      seller: updatedSeller
    });
  } catch (error) {
    console.error('Update seller profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/seller/products
// @desc    Create new product
// @access  Private/Seller
router.post('/products', [
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('description').optional().isString().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, price, category, stock, description, image } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // Generate SKU from name and timestamp
    const sku = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 8) + Date.now().toString().slice(-6);

    // For now, create a dummy category ObjectId (in production, you should have proper category management)
    // You can update this later to create/find actual categories
    const dummyCategoryId = new mongoose.Types.ObjectId();

    const productData = {
      name,
      slug,
      price: parseFloat(price),
      category: dummyCategoryId, // Use dummy ObjectId for now
      seller: req.user._id, // Use user ObjectId
      images: [image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'],
      thumbnail: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      stock: parseInt(stock) || 0,
      sku,
      description: description || `Description for ${name}`,
      status: 'active'
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/seller/products/:id
// @desc    Update product
// @access  Private/Seller
router.put('/products/:id', [
  body('name').optional().isString().trim(),
  body('price').optional().isNumeric(),
  body('category').optional().isString().trim(),
  body('stock').optional().isInt({ min: 0 }),
  body('description').optional().isString().trim(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findOne({ 
      _id: req.params.id, 
      sellerId: req.user._id 
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.price !== undefined) updates.price = parseFloat(req.body.price);
    if (req.body.category !== undefined) updates.category = req.body.category;
    if (req.body.stock !== undefined) updates.stock = parseInt(req.body.stock);
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/seller/products/:id
// @desc    Delete product
// @access  Private/Seller
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      sellerId: req.user._id 
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
