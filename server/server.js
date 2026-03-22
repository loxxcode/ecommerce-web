import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import cartRoutes from './routes/cart.js';
import wishlistRoutes from './routes/wishlist.js';
import analyticsRoutes from './routes/analytics.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import sellerRoutes from './routes/seller.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(morgan('combined'));
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allowed origins for different environments
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:8080',
      'https://ecommerce-web-beta-virid.vercel.app',
      'https://ecommerce-web-f6k7.onrender.com'
    ];
    
    if (process.env.NODE_ENV === 'production') {
      // In production, allow the specific deployed frontend
      if (origin === 'https://ecommerce-web-beta-virid.vercel.app' || 
          origin === 'https://ecommerce-web-f6k7.onrender.com') {
        return callback(null, true);
      }
    } else {
      // In development, allow localhost origins
      if (origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
    }
    
    // Check against allowed origins list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads (removed since we're using Cloudinary)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const getMongoURI = () => {
  // Use MongoDB Atlas for production, local MongoDB for development
  if (process.env.NODE_ENV === 'production') {
    return process.env.MONGODB_URI || 'mongodb+srv://loxx-dev:<db_password>@cluster0.bqlovfb.mongodb.net/?appName=Cluster0';
  } else {
    return process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
  }
};

mongoose.connect(getMongoURI())
  .then(() => {
    console.log('Connected to MongoDB');
    console.log(`Database: ${process.env.NODE_ENV === 'production' ? 'MongoDB Atlas' : 'Local MongoDB'}`);
    console.log(`URI: ${getMongoURI().replace(/\/\/[^@]+@/, '//***:***@')}`); // Hide credentials
  })
  .catch((err) => {
    console.error('MongoDB connection error details:', {
      message: err.message,
      name: err.name,
      env: process.env.NODE_ENV,
      uriProvided: !!process.env.MONGODB_URI
    });
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
