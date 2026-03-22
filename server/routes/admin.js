import express from 'express';
import { body, query, validationResult } from 'express-validator';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/users
// @desc    Get all users with filtering and pagination (buyers only by default)
// @access  Private/Admin
router.get('/users', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1 }),
  query('role').optional().isIn(['buyer']),
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

    // Build filter - only buyers by default
    const filter = { role: 'buyer' };
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status !== undefined) filter.isActive = req.query.status === 'active';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/users/:id', [
  body('isActive').optional().isBoolean(),
  body('role').optional().isIn(['buyer']),
  body('sellerStatus').optional().isIn(['pending', 'approved', 'rejected'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    const updates = {};
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
    if (req.body.role) updates.role = req.body.role;
    if (req.body.sellerStatus) updates.sellerStatus = req.body.sellerStatus;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deletion of admin users
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/sellers
// @desc    Get all sellers with stats
// @access  Private/Admin
router.get('/sellers', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1 }),
  query('status').optional().isIn(['pending', 'approved', 'rejected'])
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
    const filter = { role: 'seller' };
    if (req.query.status) filter.sellerStatus = req.query.status;

    const sellers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add seller stats
    const sellersWithStats = await Promise.all(
      sellers.map(async (seller) => {
        const productCount = await Product.countDocuments({ sellerId: seller._id });
        const orders = await Order.find({ 'items.sellerId': seller._id });
        const revenue = orders.reduce((total, order) => {
          const sellerItems = order.items.filter(item => item.sellerId.toString() === seller._id.toString());
          return total + sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }, 0);

        return {
          ...seller.toObject(),
          products: productCount,
          revenue,
          orders: orders.length,
          rating: 4.2, // Placeholder - calculate from reviews
          reviews: Math.floor(Math.random() * 100) // Placeholder
        };
      })
    );

    const total = await User.countDocuments(filter);

    res.json({
      sellers: sellersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/sellers/:id/approve
// @desc    Approve seller
// @access  Private/Admin
router.put('/sellers/:id/approve', async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);
    
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ message: 'Seller not found' });
    }

    seller.sellerStatus = 'approved';
    await seller.save();

    res.json({
      message: 'Seller approved successfully',
      seller
    });
  } catch (error) {
    console.error('Approve seller error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/sellers/:id/reject
// @desc    Reject seller
// @access  Private/Admin
router.put('/sellers/:id/reject', [
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const seller = await User.findById(req.params.id);
    
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ message: 'Seller not found' });
    }

    seller.sellerStatus = 'rejected';
    if (req.body.reason) {
      seller.rejectionReason = req.body.reason;
    }
    await seller.save();

    res.json({
      message: 'Seller rejected successfully',
      seller
    });
  } catch (error) {
    console.error('Reject seller error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/products
// @desc    Get all products
// @access  Private/Admin
router.get('/products', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1 }),
  query('status').optional().isIn(['active', 'active'])
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
    const filter = {};
    if (req.query.status !== undefined) filter.isActive = req.query.status === 'active';

    const products = await Product.find(filter)
      .populate('sellerId', 'name email')
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
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/products/:id', [
  body('isActive').optional().isBoolean(),
  body('price').optional().isNumeric(),
  body('stock').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product fields
    const updates = {};
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
    if (req.body.price) updates.price = req.body.price;
    if (req.body.stock !== undefined) updates.stock = req.body.stock;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('sellerId', 'name email');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
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

// @route   GET /api/admin/orders
// @desc    Get all orders
// @access  Private/Admin
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
    const filter = {};
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
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/orders/:id/status', [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = req.body.status;
    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get dashboard analytics
// @access  Private/Admin
router.get('/analytics', async (req, res) => {
  try {
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const activeSellers = await User.countDocuments({ role: 'seller', sellerStatus: 'approved' });
    const totalProducts = await Product.countDocuments({ isActive: true });
    
    // Calculate total revenue
    const orders = await Order.find({ status: 'delivered' });
    const totalRevenue = orders.reduce((total, order) => total + order.totalAmount, 0);
    
    // Get buyer growth (new buyers in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newBuyers = await User.countDocuments({ 
      role: 'buyer',
      createdAt: { $gte: thirtyDaysAgo } 
    });
    const buyerGrowth = totalBuyers > 0 ? ((newBuyers / totalBuyers) * 100).toFixed(1) + '%' : '0%';
    
    // Get new sellers
    const newSellers = await User.countDocuments({ 
      role: 'seller', 
      sellerStatus: 'approved',
      createdAt: { $gte: thirtyDaysAgo } 
    });
    
    // Get new products
    const newProducts = await Product.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    
    // Revenue growth (compare with previous month)
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const previousMonthOrders = await Order.find({ 
      status: 'delivered',
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });
    const previousRevenue = previousMonthOrders.reduce((total, order) => total + order.totalAmount, 0);
    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1) + '% vs last month'
      : 'First month';

    res.json({
      totalBuyers,
      activeSellers,
      totalProducts,
      totalRevenue,
      buyerGrowth,
      newSellers,
      newProducts,
      revenueGrowth
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics/sales
// @desc    Get sales data for charts
// @access  Private/Admin
router.get('/analytics/sales', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y'])
], async (req, res) => {
  try {
    const period = req.query.period || '30d';
    let days = 30;
    
    switch (period) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      case '1y': days = 365; break;
    }

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Get orders grouped by date
    const orders = await Order.find({
      status: 'delivered',
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Group by month for chart data
    const monthlyData = {};
    orders.forEach(order => {
      const month = order.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, revenue: 0, orders: 0 };
      }
      monthlyData[month].revenue += order.totalAmount;
      monthlyData[month].orders += 1;
    });

    const chartData = Object.values(monthlyData);

    res.json({ monthlySales: chartData });
  } catch (error) {
    console.error('Get sales data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics/users
// @desc    Get user statistics
// @access  Private/Admin
router.get('/analytics/users', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    // Get users by role
    const buyers = await User.countDocuments({ role: 'buyer' });
    const sellers = await User.countDocuments({ role: 'seller' });
    const admins = await User.countDocuments({ role: 'admin' });
    
    // Get seller status breakdown
    const pendingSellers = await User.countDocuments({ role: 'seller', sellerStatus: 'pending' });
    const approvedSellers = await User.countDocuments({ role: 'seller', sellerStatus: 'approved' });
    const rejectedSellers = await User.countDocuments({ role: 'seller', sellerStatus: 'rejected' });
    
    // Get new users in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const growth = totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(1) : '0';
    
    // Get new buyers in last 30 days
    const newBuyers = await User.countDocuments({ 
      role: 'buyer',
      createdAt: { $gte: thirtyDaysAgo } 
    });
    const buyerGrowth = buyers > 0 ? ((newBuyers / buyers) * 100).toFixed(1) : '0';

    res.json({
      totalUsers,
      totalBuyers: buyers,
      sellers,
      admins,
      pendingSellers,
      approvedSellers,
      rejectedSellers,
      newSellers: newUsers,
      newBuyers,
      growth: growth + '%',
      buyerGrowth: buyerGrowth + '%'
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics/products
// @desc    Get product statistics
// @access  Private/Admin
router.get('/analytics/products', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const inactiveProducts = await Product.countDocuments({ isActive: false });
    
    // Get products by category
    const productsByCategory = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get new products in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newProducts = await Product.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      totalProducts,
      activeProducts,
      inactiveProducts,
      productsByCategory,
      newProducts
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
