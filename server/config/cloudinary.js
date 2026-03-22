import multer from "multer";
import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create Cloudinary storage for multer
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

// Upload image to Cloudinary
export const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'ecommerce',
      resource_type: 'image',
      quality: 'auto:good',
      fetch_format: 'auto'
    });
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
      size: result.bytes,
      format: result.format
    };
  } catch (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

// Upload buffer to Cloudinary
export const uploadBufferToCloudinary = async (buffer, filename) => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'ecommerce',
          resource_type: 'image',
          quality: 'auto:good',
          fetch_format: 'auto',
          public_id: filename.split('.')[0]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve({
            url: result.secure_url,
            public_id: result.public_id,
            size: result.bytes,
            format: result.format,
            path: result.secure_url // For compatibility with existing code
          });
        }
      ).end(buffer);
    });
  } catch (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

// Helper function to upload multiple images
export const uploadMultipleImages = async (files) => {
  try {
    const uploadPromises = files.map(file => 
      uploadBufferToCloudinary(file.buffer, file.originalname)
    );

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error(`Failed to upload images: ${error.message}`);
  }
};

// Helper function to delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

// Helper function to delete multiple images
export const deleteMultipleImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete images: ${error.message}`);
  }
};

// Export Cloudinary and storage for multer
export { cloudinary, storage };
