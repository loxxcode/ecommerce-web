import express from 'express';
import { body, validationResult } from 'express-validator';
import Category from '../models/Category.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name slug')
      .sort({ sortOrder: 1, name: 1 });

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name slug');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category (admin only)
router.post('/', authenticate, authorize('admin'), [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('parentCategory').optional().isMongoId().withMessage('Invalid parent category ID'),
  body('icon').optional().isLength({ max: 10 }).withMessage('Icon cannot exceed 10 characters'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, parentCategory, icon, image, sortOrder } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    // Verify parent category exists if provided
    if (parentCategory) {
      const parentExists = await Category.findById(parentCategory);
      if (!parentExists) {
        return res.status(400).json({ message: 'Invalid parent category' });
      }
    }

    const category = new Category({
      name: name.trim(),
      description,
      parentCategory,
      icon: icon || '📦',
      image,
      sortOrder: sortOrder || 0
    });

    await category.save();

    const populatedCategory = await Category.findById(category._id)
      .populate('parentCategory', 'name slug');

    res.status(201).json({
      message: 'Category created successfully',
      category: populatedCategory
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category (admin only)
router.put('/:id', authenticate, authorize('admin'), [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('parentCategory').optional().isMongoId().withMessage('Invalid parent category ID'),
  body('icon').optional().isLength({ max: 10 }).withMessage('Icon cannot exceed 10 characters'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        category[key] = updates[key];
      }
    });

    // Verify parent category exists if provided
    if (updates.parentCategory) {
      const parentExists = await Category.findById(updates.parentCategory);
      if (!parentExists) {
        return res.status(400).json({ message: 'Invalid parent category' });
      }
      
      // Prevent circular reference
      if (updates.parentCategory === category._id.toString()) {
        return res.status(400).json({ message: 'Category cannot be its own parent' });
      }
    }

    await category.save();

    const updatedCategory = await Category.findById(category._id)
      .populate('parentCategory', 'name slug');

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has subcategories
    const subcategories = await Category.find({ parentCategory: req.params.id });
    if (subcategories.length > 0) {
      return res.status(400).json({ message: 'Cannot delete category with subcategories' });
    }

    // Check if category has products (you might want to import Product model here)
    // For now, we'll just soft delete by setting isActive to false
    category.isActive = false;
    await category.save();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category tree
router.get('/tree/all', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name slug')
      .sort({ sortOrder: 1, name: 1 });

    // Build tree structure
    const buildTree = (categories, parentId = null) => {
      return categories
        .filter(category => {
          if (!parentId) {
            return !category.parentCategory;
          }
          return category.parentCategory && category.parentCategory._id.toString() === parentId;
        })
        .map(category => ({
          ...category.toObject(),
          subcategories: buildTree(categories, category._id.toString())
        }));
    };

    const categoryTree = buildTree(categories);

    res.json({ categories: categoryTree });
  } catch (error) {
    console.error('Get category tree error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
