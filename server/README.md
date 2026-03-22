# E-commerce Backend API

A comprehensive backend API for an e-commerce platform built with Node.js, Express, MongoDB, and Cloudinary for image management.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (buyer, seller, admin)
- **Product Management**: CRUD operations for products with categories, images, and reviews
- **Order Management**: Complete order lifecycle with status tracking
- **Cart & Wishlist**: Shopping cart and wishlist functionality
- **User Management**: Multi-role user system with profiles
- **Analytics**: Sales analytics for admin, seller, and buyer dashboards
- **Cloudinary Integration**: Cloud-based image storage and management
- **File Upload**: Image upload support for products, avatars, and store logos
- **Security**: Rate limiting, CORS, helmet, input validation
- **Error Handling**: Comprehensive error handling and validation

## Tech Stack

- **Node.js** with ES modules
- **Express.js** for REST API
- **MongoDB** with Mongoose ODM
- **Cloudinary** for cloud image storage
- **JWT** for authentication
- **Multer** for file uploads
- **Express-validator** for input validation
- **Helmet** for security headers
- **Rate limiting** for API protection

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. Start the server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Cloudinary Setup

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and API secret from the dashboard
3. Add them to your `.env` file
4. Create a folder named `ecommerce` in your Cloudinary account

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Products
- `GET /api/products` - Get all products (with filtering & pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (seller/admin) - **multipart/form-data**
- `PUT /api/products/:id` - Update product (seller/admin) - **multipart/form-data**
- `DELETE /api/products/:id` - Delete product (seller/admin)
- `POST /api/products/:id/reviews` - Add product review
- `GET /api/products/seller/:sellerId` - Get seller's products

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)
- `GET /api/categories/tree/all` - Get category tree

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart
- `GET /api/cart/summary` - Get cart summary

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/add` - Add item to wishlist
- `DELETE /api/wishlist/remove/:productId` - Remove item from wishlist
- `GET /api/wishlist/check/:productId` - Check if product is in wishlist
- `DELETE /api/wishlist/clear` - Clear wishlist
- `POST /api/wishlist/move-to-cart/:productId` - Move item to cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (seller/admin)
- `PUT /api/orders/:id/cancel` - Cancel order (buyer)
- `GET /api/orders/seller/my-orders` - Get seller's orders
- `GET /api/orders/admin/all` - Get all orders (admin)

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)
- `GET /api/users/sellers/all` - Get all sellers (public)
- `PUT /api/users/profile/update` - Update own profile
- `GET /api/users/stats/overview` - Get user statistics (admin)

### Analytics
- `GET /api/analytics/overview` - Get analytics overview (admin)
- `GET /api/analytics/seller` - Get seller analytics (seller)
- `GET /api/analytics/buyer` - Get buyer analytics (buyer)
- `GET /api/analytics/products/:id` - Get product analytics (seller)

### Upload (Image Management)
- `POST /api/upload/avatar` - Upload user avatar - **multipart/form-data**
- `DELETE /api/upload/avatar` - Delete user avatar
- `POST /api/upload/store-logo` - Upload store logo (seller) - **multipart/form-data**
- `POST /api/upload/category-image` - Upload category image (admin) - **multipart/form-data**

## Image Upload Usage

### Product Images
When creating or updating products, use `multipart/form-data`:
```javascript
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);
formData.append('name', 'Product Name');
formData.append('price', '99.99');
formData.append('category', 'category_id');
// ... other fields

POST /api/products
Content-Type: multipart/form-data
```

### User Avatar
```javascript
const formData = new FormData();
formData.append('avatar', file);

POST /api/upload/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

## User Roles

### Buyer
- Browse products and categories
- Add items to cart and wishlist
- Place orders and track status
- Write product reviews
- View order history
- Upload avatar

### Seller
- Manage products (CRUD)
- View and fulfill orders
- Access sales analytics
- Manage store profile
- Track order status
- Upload avatar and store logo

### Admin
- Manage all users and products
- View platform analytics
- Manage categories
- Oversee all orders
- System administration
- Upload category images

## Data Models

### User
- name, email, password
- role (buyer, seller, admin)
- profile information
- store details (for sellers)
- avatar (Cloudinary URL)
- storeLogo (Cloudinary URL for sellers)

### Product
- name, description, price
- category, seller
- images (Cloudinary URLs array)
- stock, SKU
- reviews and ratings

### Order
- buyer, items, total
- shipping/billing addresses
- status tracking
- payment information

### Category
- name, slug, icon
- parent/child relationships
- product counts
- image (Cloudinary URL)

## Cloudinary Integration

Images are automatically:
- Uploaded to Cloudinary with optimized settings
- Stored in the `ecommerce` folder
- Served via CDN for fast loading
- Automatically formatted (webp, quality optimization)
- Deleted from Cloudinary when no longer needed

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Input validation and sanitization
- Security headers with Helmet
- Role-based access control
- Cloudinary secure URLs

## Error Handling

Standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...]
}
```

## Development

The server runs on port 5000 by default and connects to MongoDB at `mongodb://localhost:27017/ecommerce`.

## Testing

```bash
npm test
```

## License

MIT
