import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { uploadMultiple, uploadToCloudinaryMiddleware } from '../middleware/upload.js';
import { deleteMultipleImages } from '../config/cloudinary.js';

const router = express.Router();

// Get all products with filtering and pagination
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isMongoId().withMessage('Invalid category ID'),
  query('seller').optional().isMongoId().withMessage('Invalid seller ID'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be positive'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
  query('search').optional().trim().isLength({ min: 1 }).withMessage('Search term cannot be empty'),
  query('sort').optional().isIn(['price-asc', 'price-desc', 'rating-desc', 'newest', 'name-asc']).withMessage('Invalid sort option')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      category,
      seller,
      minPrice,
      maxPrice,
      search,
      sort = 'newest'
    } = req.query;

    // Build query
    const query = { status: 'active' };

    if (category) {
      query.category = category;
    }

    if (seller) {
      query.seller = seller;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    let sortOptions = {};
    switch (sort) {
      case 'price-asc':
        sortOptions = { price: 1 };
        break;
      case 'price-desc':
        sortOptions = { price: -1 };
        break;
      case 'rating-desc':
        sortOptions = { 'rating.average': -1 };
        break;
      case 'name-asc':
        sortOptions = { name: 1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('seller', 'name storeName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('seller', 'name storeName')
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status !== 'active' && (!req.user || (req.user._id.toString() !== product.seller._id.toString() && req.user.role !== 'admin'))) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (seller only)
router.post('/', authenticate, authorize('seller', 'admin'), uploadMultiple('images', 5), uploadToCloudinaryMiddleware, [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('category').isMongoId().withMessage('Invalid category ID'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be non-negative integer'),
  body('badge').optional().isIn(['Best Seller', 'New', 'Top Rated', 'Popular', 'Deal']).withMessage('Invalid badge')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one product image is required' });
    }

    const {
      name,
      description,
      price,
      originalPrice,
      category,
      stock,
      badge,
      tags,
      weight,
      dimensions
    } = req.body;

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Extract Cloudinary URLs from uploaded files
    const images = req.files.map(file => file.url); // Cloudinary URL is in file.url
    const thumbnail = images[0]; // Use first image as thumbnail

    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      category,
      seller: req.user._id,
      stock,
      images,
      thumbnail,
      badge,
      tags,
      weight,
      dimensions
    });

    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('seller', 'name storeName');

    res.status(201).json({
      message: 'Product created successfully',
      product: populatedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (seller or admin)
router.put('/:id', authenticate, authorize('seller', 'admin'), uploadMultiple('images', 5), [
  body('name').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('category').optional().isMongoId().withMessage('Invalid category ID'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be non-negative integer'),
  body('badge').optional().isIn(['Best Seller', 'New', 'Top Rated', 'Popular', 'Deal', null]).withMessage('Invalid badge')
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

    // Check permissions
    if (req.user.role === 'seller' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own products' });
    }

    const updates = req.body;
    
    // Handle image updates
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      const oldImagePublicIds = product.images.map(imageUrl => {
        // Extract public_id from Cloudinary URL
        const urlParts = imageUrl.split('/');
        const filenameWithExtension = urlParts[urlParts.length - 1];
        const publicId = filenameWithExtension.split('.')[0];
        return `ecommerce/${publicId}`;
      });
      
      if (oldImagePublicIds.length > 0) {
        try {
          await deleteMultipleImages(oldImagePublicIds);
        } catch (error) {
          console.error('Error deleting old images:', error);
        }
      }

      // Add new images
      const newImages = req.files.map(file => file.path);
      updates.images = newImages;
      updates.thumbnail = newImages[0];
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        product[key] = updates[key];
      }
    });

    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('seller', 'name storeName');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (seller or admin)
router.delete('/:id', authenticate, authorize('seller', 'admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check permissions
    if (req.user.role === 'seller' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }

    // Delete images from Cloudinary
    const imagePublicIds = product.images.map(imageUrl => {
      // Extract public_id from Cloudinary URL
      const urlParts = imageUrl.split('/');
      const filenameWithExtension = urlParts[urlParts.length - 1];
      const publicId = filenameWithExtension.split('.')[0];
      return `ecommerce/${publicId}`;
    });
    
    if (imagePublicIds.length > 0) {
      try {
        await deleteMultipleImages(imagePublicIds);
      } catch (error) {
        console.error('Error deleting product images:', error);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product review
router.post('/:id/reviews', authenticate, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters')
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

    // Check if user already reviewed
    const existingReview = product.reviews.find(review => 
      review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const { rating, comment } = req.body;

    product.reviews.push({
      user: req.user._id,
      rating,
      comment
    });

    product.updateRating();
    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate('reviews.user', 'name avatar');

    res.status(201).json({
      message: 'Review added successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get seller products
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const products = await Product.find({ seller: sellerId, status: 'active' })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Product.countDocuments({ seller: sellerId, status: 'active' });

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total
      }
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
