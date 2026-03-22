import multer from 'multer';
import { uploadBufferToCloudinary } from '../config/cloudinary.js';

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
  }
};

// Upload middleware using memory storage (will upload to Cloudinary in routes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Single file upload
export const uploadSingle = (fieldName) => upload.single(fieldName);

// Multiple files upload
export const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

// Upload to Cloudinary middleware
export const uploadToCloudinaryMiddleware = async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      const uploadedFiles = await Promise.all(
        req.files.map(file => uploadBufferToCloudinary(file.buffer, file.originalname))
      );
      
      // Replace req.files with Cloudinary URLs
      req.files = uploadedFiles;
    }
    
    if (req.file) {
      const uploadedFile = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
      req.file = uploadedFile;
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
};

export default upload;
