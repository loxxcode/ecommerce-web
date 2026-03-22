import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [wishlistItemSchema]
}, {
  timestamps: true
});

// Check if product is already in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
  return this.items.some(item => item.product.toString() === productId.toString());
};

// Add product to wishlist
wishlistSchema.methods.addProduct = function(productId) {
  if (!this.hasProduct(productId)) {
    this.items.push({ product: productId });
    return true;
  }
  return false;
};

// Remove product from wishlist
wishlistSchema.methods.removeProduct = function(productId) {
  const initialLength = this.items.length;
  this.items = this.items.filter(item => item.product.toString() !== productId.toString());
  return this.items.length < initialLength;
};

export default mongoose.model('Wishlist', wishlistSchema);
