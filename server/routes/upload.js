import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadSingle, uploadToCloudinaryMiddleware } from '../middleware/upload.js';
import { deleteImage } from '../config/cloudinary.js';
import User from '../models/User.js';

const router = express.Router();

// Upload user avatar
router.post('/avatar', authenticate, uploadSingle('avatar'), uploadToCloudinaryMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      try {
        const oldAvatarPublicId = user.avatar.split('/').pop().split('.')[0];
        await deleteImage(`avatars/${oldAvatarPublicId}`);
      } catch (error) {
        console.error('Error deleting old avatar:', error);
      }
    }

    // Update user avatar with Cloudinary URL
    user.avatar = req.file.url;
    await user.save();

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user avatar
router.delete('/avatar', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.avatar) {
      return res.status(400).json({ message: 'No avatar to delete' });
    }

    // Delete avatar from Cloudinary
    try {
      const avatarPublicId = user.avatar.split('/').pop().split('.')[0];
      await deleteImage(`avatars/${avatarPublicId}`);
    } catch (error) {
      console.error('Error deleting avatar:', error);
    }

    // Remove avatar from user profile
    user.avatar = null;
    await user.save();

    res.json({ message: 'Avatar deleted successfully' });
  } catch (error) {
    console.error('Avatar deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload store logo (sellers only)
router.post('/store-logo', authenticate, uploadSingle('logo'), uploadToCloudinaryMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'seller' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Only sellers can upload store logos' });
    }

    // Delete old logo if exists
    if (user.storeLogo) {
      try {
        const oldLogoPublicId = user.storeLogo.split('/').pop().split('.')[0];
        await deleteImage(`store-logos/${oldLogoPublicId}`);
      } catch (error) {
        console.error('Error deleting old logo:', error);
      }
    }

    // Update store logo with Cloudinary URL
    user.storeLogo = req.file.url;
    await user.save();

    res.json({
      message: 'Store logo uploaded successfully',
      storeLogo: user.storeLogo
    });
  } catch (error) {
    console.error('Store logo upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload category image (admin only)
router.post('/category-image', authenticate, uploadSingle('image'), uploadToCloudinaryMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can upload category images' });
    }

    res.json({
      message: 'Category image uploaded successfully',
      imageUrl: req.file.url
    });
  } catch (error) {
    console.error('Category image upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
