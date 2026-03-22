import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, X, Save, Eye, ImagePlus, Star, Package, Tag } from "lucide-react";
import { toast } from "sonner";
import { formatFRW } from "@/lib/currency";
import { sellerAPI } from "@/services/sellerAPI";

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock?: number;
  image: string;
  seller: string;
  sellerId: string;
  rating: number;
  reviews: number;
  badge?: string | null;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

const SellerProducts = () => {
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    price: "", 
    category: "Electronics", 
    stock: "", 
    description: "", 
    imagePreview: "",
    imageFile: null as File | null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await sellerAPI.getProducts();
      setProductList(response.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await sellerAPI.deleteProduct(id);
      setProductList(prev => prev.filter(p => p._id !== id));
      toast.success("Product deleted");
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id);
    setEditForm({ 
      name: product.name, 
      price: product.price, 
      category: product.category, 
      stock: product.stock,
      description: product.description
    });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await sellerAPI.updateProduct(id, editForm);
      setProductList(prev => prev.map(p => p._id === id ? { ...p, ...editForm } : p));
      setEditingId(null);
      setEditForm({});
      toast.success("Product updated");
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploading(true);
        
        // Store the actual file for later upload
        // Create preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setNewProduct(prev => ({ 
            ...prev, 
            imagePreview: result,
            imageFile: file
          }));
          toast.success('Image selected for upload');
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error selecting image:', error);
        toast.error('Failed to select image');
      } finally {
        setUploading(false);
      }
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    // Parse Cloudinary URL from environment
    const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_URL?.replace('CLOUDINARY_URL=', '');
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ecommerce_products';
    
    if (cloudinaryUrl && cloudinaryUrl.includes('cloudinary://')) {
      // Extract cloud name from the URL
      const cloudName = cloudinaryUrl.split('@')[1];
      
      // Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      
      try {
        // Upload to Cloudinary
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (data.secure_url) {
          return data.secure_url;
        } else {
          throw new Error('Cloudinary upload failed');
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed:', cloudinaryError);
        // Fallback to Base64
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      }
    } else {
      // Fallback to Base64 if Cloudinary is not configured
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) { 
      toast.error("Name and price are required"); 
      return; 
    }

    try {
      setUploading(true);
      
      // Upload image first if there's a file
      let imageUrl = newProduct.imagePreview;
      if (newProduct.imageFile) {
        toast.info('Uploading image...');
        imageUrl = await uploadImageToCloudinary(newProduct.imageFile);
        toast.success('Image uploaded successfully');
      }

      const productData = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        stock: parseInt(newProduct.stock) || 0,
        description: newProduct.description,
        image: imageUrl
      };

      console.log('Sending product data:', productData);

      const response = await sellerAPI.createProduct(productData);
      console.log('Product creation response:', response);
      
      setProductList(prev => [response.product, ...prev]);
      setNewProduct({ 
        name: "", 
        price: "", 
        category: "Electronics", 
        stock: "", 
        description: "", 
        imagePreview: "",
        imageFile: null
      });
      setShowAddModal(false);
      toast.success("Product added successfully");
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">My Products <span className="text-muted-foreground font-normal text-lg">({productList.length})</span></h1>
        <Button className="gap-2 rounded-xl" onClick={() => setShowAddModal(true)}><Plus size={14} /> Add Product</Button>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-elevated max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-lg font-bold">Add New Product</h3>
              <button className="rounded-lg p-1 hover:bg-secondary transition-colors" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground">Product Image</label>
              <div
                className="mt-1.5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 p-6 cursor-pointer hover:border-primary/40 hover:bg-secondary/50 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                {newProduct.imagePreview ? (
                  <div className="relative">
                    <img src={newProduct.imagePreview} alt="Preview" className="h-32 w-32 rounded-xl object-cover" />
                    <button
                      className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-0.5"
                      onClick={e => { e.stopPropagation(); setNewProduct(p => ({ ...p, imagePreview: "" })); }}
                    ><X size={12} /></button>
                  </div>
                ) : (
                  <>
                    <ImagePlus size={28} className="text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Click to upload product image</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">PNG, JPG up to 5MB</p>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Product Name</label>
                <input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Wireless Headphones" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <textarea value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} placeholder="Describe your product..." rows={3} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Price (FRW)</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">FRW</span>
                    <input type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} placeholder="50,000" className="w-full rounded-lg border border-input bg-background pl-11 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Stock Quantity</label>
                  <input type="number" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))} placeholder="50" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30">
                  <option>Electronics</option><option>Fashion</option><option>Home & Garden</option><option>Sports</option><option>Books</option><option>Beauty</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <Button variant="outline" className="rounded-lg" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button className="rounded-lg gap-2" onClick={handleAddProduct}><Plus size={14} /> Add Product</Button>
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4" onClick={() => setViewProduct(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-elevated max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img src={viewProduct.image} alt={viewProduct.name} className="w-full h-56 object-cover rounded-t-2xl" />
              <button className="absolute top-3 right-3 rounded-full bg-card/80 backdrop-blur-sm p-1.5 hover:bg-card transition-colors" onClick={() => setViewProduct(null)}><X size={16} /></button>
              {viewProduct.badge && (
                <span className="absolute top-3 left-3 rounded-full bg-primary text-primary-foreground px-2.5 py-0.5 text-[10px] font-bold">{viewProduct.badge}</span>
              )}
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-heading text-xl font-bold">{viewProduct.name}</h3>
                  <span className="text-lg font-bold text-primary whitespace-nowrap">{formatFRW(viewProduct.price)}</span>
                </div>
                {viewProduct.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">{formatFRW(viewProduct.originalPrice)}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
                  <Tag size={11} /> {viewProduct.category}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
                  <Package size={11} /> {viewProduct.stock ?? 0} in stock
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
                  <Star size={11} className="text-warning" /> {viewProduct.rating} ({viewProduct.reviews} reviews)
                </span>
              </div>

              {viewProduct.description && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-1">Description</h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">{viewProduct.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                <div className="rounded-lg bg-secondary/50 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Seller</p>
                  <p className="text-sm font-semibold mt-0.5">{viewProduct.seller}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Product ID</p>
                  <p className="text-sm font-semibold mt-0.5">#{viewProduct._id}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 rounded-lg" onClick={() => { setViewProduct(null); handleEdit(viewProduct); }}>
                  <Edit size={14} className="mr-1.5" /> Edit
                </Button>
                <Button className="flex-1 rounded-lg" onClick={() => setViewProduct(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Rating</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {productList.map(p => (
              <tr key={p._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  {editingId === p._id ? (
                    <input value={editForm.name || ""} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="rounded-md border border-input bg-background px-2 py-1 text-sm w-full max-w-[200px]" />
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <img src={p.image} alt={p.name} className="h-9 w-9 rounded-lg object-cover" />
                      <span className="font-medium line-clamp-1">{p.name}</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{editingId === p._id ? (
                  <select value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} className="rounded-md border border-input bg-background px-2 py-1 text-xs"><option>Electronics</option><option>Fashion</option><option>Home & Garden</option><option>Sports</option><option>Books</option><option>Beauty</option></select>
                ) : p.category}</td>
                <td className="px-4 py-3 font-medium">{editingId === p._id ? (
                  <input type="number" value={editForm.price || ""} onChange={e => setEditForm(f => ({ ...f, price: parseFloat(e.target.value) }))} className="rounded-md border border-input bg-background px-2 py-1 text-sm w-24" />
                ) : formatFRW(p.price)}</td>
                <td className="px-4 py-3">{editingId === p._id ? (
                  <input type="number" value={editForm.stock || ""} onChange={e => setEditForm(f => ({ ...f, stock: parseInt(e.target.value) }))} className="rounded-md border border-input bg-background px-2 py-1 text-sm w-16" />
                ) : (
                  <span className={p.stock && p.stock < 20 ? "text-warning font-medium" : ""}>{p.stock ?? "—"}</span>
                )}</td>
                <td className="px-4 py-3 text-xs">{p.rating} ⭐</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {editingId === p._id ? (
                      <>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-success" onClick={() => handleSaveEdit(p._id)}><Save size={14} /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}><X size={14} /></Button>
                      </>
                    ) : (
                      <>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setViewProduct(p)}><Eye size={14} /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(p)}><Edit size={14} /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p._id)}><Trash2 size={14} /></Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerProducts;
