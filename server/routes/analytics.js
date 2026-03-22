import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

const router = express.Router();

// Get analytics overview (admin only)
router.get('/overview', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { period = '30' } = req.query; // period in days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Basic stats
    const totalOrders = await Order.countDocuments({ createdAt: { $gte: startDate } });
    const totalRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalProducts = await Product.countDocuments({ status: 'active' });
    const totalUsers = await User.countDocuments({ isActive: true });

    // Monthly sales data
    const monthlySales = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$items.product',
          totalSales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          sales: '$totalSales',
          revenue: '$revenue'
        }
      }
    ]);

    // Top sellers
    const topSellers = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$items.seller',
          totalSales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'seller'
        }
      },
      { $unwind: '$seller' },
      {
        $project: {
          name: '$seller.name',
          storeName: '$seller.storeName',
          sales: '$totalSales',
          revenue: '$revenue'
        }
      }
    ]);

    res.json({
      overview: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalProducts,
        totalUsers
      },
      monthlySales: monthlySales.map(item => ({
        month: item._id,
        sales: item.sales,
        revenue: item.revenue,
        orders: item.orders
      })),
      topProducts,
      topSellers
    });
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get seller analytics (seller only)
router.get('/seller', authenticate, authorize('seller'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Seller's orders
    const sellerOrders = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.seller': req.user._id, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalOrders: { $addToSet: '$_id' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalItems: { $sum: '$items.quantity' }
        }
      }
    ]);

    // Monthly sales for this seller
    const monthlySales = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.seller': req.user._id, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          sales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orders: { $addToSet: '$_id' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: '$_id',
          sales: 1,
          revenue: 1,
          orders: { $size: '$orders' }
        }
      }
    ]);

    // Top products for this seller
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.seller': req.user._id, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$items.product',
          totalSales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          sales: '$totalSales',
          revenue: '$revenue'
        }
      }
    ]);

    // Order status breakdown
    const orderStatuses = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.seller': req.user._id, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const stats = sellerOrders[0] || { totalOrders: [], totalRevenue: 0, totalItems: 0 };

    res.json({
      overview: {
        totalOrders: stats.totalOrders.length,
        totalRevenue: stats.totalRevenue,
        totalItems: stats.totalItems
      },
      monthlySales,
      topProducts,
      orderStatuses: orderStatuses.map(item => ({
        status: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Get seller analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get buyer analytics (buyer only)
router.get('/buyer', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Buyer's orders
    const orders = await Order.find({ 
      buyer: req.user._id, 
      createdAt: { $gte: startDate } 
    }).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => 
      order.status !== 'cancelled' ? sum + order.totalAmount : sum, 0
    );
    const totalItems = orders.reduce((sum, order) => 
      order.status !== 'cancelled' ? sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0) : sum, 0
    );

    // Monthly spending
    const monthlySpending = await Order.aggregate([
      { $match: { buyer: req.user._id, createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          spent: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Order status breakdown
    const orderStatuses = await Order.aggregate([
      { $match: { buyer: req.user._id, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Top categories
    const topCategories = await Order.aggregate([
      { $match: { buyer: req.user._id, createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          count: { $sum: '$items.quantity' },
          spent: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { spent: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      overview: {
        totalOrders,
        totalSpent,
        totalItems
      },
      monthlySpending: monthlySpending.map(item => ({
        month: item._id,
        spent: item.spent,
        orders: item.orders
      })),
      orderStatuses: orderStatuses.map(item => ({
        status: item._id,
        count: item.count
      })),
      topCategories: topCategories.map(item => ({
        category: item._id,
        count: item.count,
        spent: item.spent
      }))
    });
  } catch (error) {
    console.error('Get buyer analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product analytics (seller only)
router.get('/products/:id', authenticate, authorize('seller'), async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30' } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Verify product belongs to seller
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Product sales data
    const salesData = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.product': product._id, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orders: { $addToSet: '$_id' }
        }
      }
    ]);

    // Monthly sales for this product
    const monthlySales = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.product': product._id, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          sold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orders: { $addToSet: '$_id' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: '$_id',
          sold: 1,
          revenue: 1,
          orders: { $size: '$orders' }
        }
      }
    ]);

    // Recent orders for this product
    const recentOrders = await Order.find({ 'items.product': product._id })
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const stats = salesData[0] || { totalSold: 0, totalRevenue: 0, orders: [] };

    res.json({
      product: {
        id: product._id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        rating: product.rating
      },
      overview: {
        totalSold: stats.totalSold,
        totalRevenue: stats.totalRevenue,
        totalOrders: stats.orders.length
      },
      monthlySales,
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        buyer: order.buyer.name,
        email: order.buyer.email,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        quantity: order.items.find(item => item.product.toString() === product._id.toString())?.quantity || 0
      }))
    });
  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
