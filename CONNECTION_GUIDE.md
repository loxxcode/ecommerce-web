# Frontend-Backend Connection Guide

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd server
npm run dev
```
The backend should start on `http://localhost:5000`

### 2. Start Frontend Server
```bash
cd client
npm run dev
```
The frontend should start on `http://localhost:5173`

### 3. Test Connection

Visit `http://localhost:5173` and you'll see:

1. **API Test Section** on the homepage
   - Tests connection to backend
   - Shows categories and products from database
   - Green indicators = connected, Red = connection issues

2. **Authentication Flow**
   - Login: `/login` - Real authentication with backend
   - Register: `/register?role=buyer` or `/register?role=seller`
   - JWT tokens stored in localStorage

3. **API Endpoints Available**
   - ✅ Auth: `/api/auth/*`
   - ✅ Products: `/api/products/*`
   - ✅ Categories: `/api/categories/*`
   - ✅ Orders: `/api/orders/*`
   - ✅ Cart: `/api/cart/*`
   - ✅ Upload: `/api/upload/*`

## 🔧 Configuration

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend API Service
The frontend API service is configured to connect to:
- **Base URL**: `http://localhost:5000/api`
- **Auth**: JWT tokens in localStorage
- **Image Uploads**: Cloudinary integration

## 🧪 Testing Features

### 1. Authentication
```javascript
// Login with real backend
await authAPI.login('email', 'password', 'buyer');

// Register new user
await authAPI.register('name', 'email', 'password', 'seller');
```

### 2. Product Management
```javascript
// Get all products
const products = await productsAPI.getAll();

// Create product with image upload
const formData = new FormData();
formData.append('name', 'Product Name');
formData.append('price', '99.99');
formData.append('images', file);
await productsAPI.create(formData);
```

### 3. Real-time Updates
- Authentication state persists across page refreshes
- Loading states during API calls
- Error handling with toast notifications

## 🔍 Troubleshooting

### Backend Not Starting
1. Check MongoDB is running: `mongod`
2. Install dependencies: `npm install`
3. Check port 5000 is not in use

### Frontend Connection Issues
1. Check backend is running on port 5000
2. Verify CORS settings in server.js
3. Check browser console for API errors

### Database Issues
1. MongoDB connection string in .env
2. Database permissions and network access
3. Check MongoDB logs: `mongod --dbpath /data/db`

## 📱 Available Routes

### Public Routes
- `GET /` - Homepage (with API test)
- `GET /login` - Login page
- `GET /register` - Registration page
- `GET /products` - Product listing
- `GET /products/:id` - Product details

### Protected Routes (require auth)
- `/dashboard` - Buyer dashboard
- `/seller` - Seller dashboard
- `/admin` - Admin dashboard
- `/cart` - Shopping cart
- `/orders` - Order management

## 🎯 Next Steps

1. **Test basic functionality** - Use the API Test component
2. **Create test users** - Register buyer/seller accounts
3. **Upload products** - Test Cloudinary image uploads
4. **Place orders** - Test complete e-commerce flow
5. **Check admin panel** - Verify user management

## 📊 API Response Format

All API responses follow this format:
```json
{
  "message": "Success message",
  "data": { ... },
  "errors": [...]
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["field1": "Error message"]
}
```
