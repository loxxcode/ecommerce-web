import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, X, Save, Eye, Star, Package, Tag } from "lucide-react";
import { toast } from "sonner";
import { formatFRW } from "@/lib/currency";
import { adminAPI } from "@/services/adminAPI";

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

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProducts();
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminAPI.deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success("Product removed");
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
      isActive: product.isActive
    });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await adminAPI.updateProduct(id, editForm);
      setProducts(prev => prev.map(p => p._id === id ? { ...p, ...editForm } : p));
      setEditingId(null);
      setEditForm({});
      toast.success("Product updated");
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading products...</div>;
  }

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-bold">Products Management <span className="text-muted-foreground font-normal text-lg">({products.length})</span></h1>

      {/* View Product Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4" onClick={() => setViewProduct(null)}>
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-elevated max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="relative">
            <img src={viewProduct.image} alt={viewProduct.name} className="w-full h-48 object-cover rounded-t-2xl" />
            <div className="absolute top-4 right-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                viewProduct.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {viewProduct.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-xl font-bold">{viewProduct.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">by {viewProduct.seller}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{formatFRW(viewProduct.price)}</p>
                {viewProduct.originalPrice && (
                  <p className="text-sm text-muted-foreground line-through">{formatFRW(viewProduct.originalPrice)}</p>
                )}
              </div>
            </div>

            {viewProduct.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{viewProduct.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
                <Tag size={11} /> {viewProduct.category}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
                <Package size={11} /> {viewProduct.stock || 0} in stock
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
                <Star size={11} className="text-warning" /> {viewProduct.rating} ({viewProduct.reviews} reviews)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Created</p>
                <p className="text-sm font-bold mt-0.5">{new Date(viewProduct.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Seller ID</p>
                <p className="text-sm font-bold mt-0.5">{viewProduct.sellerId}</p>
              </div>
            </div>

            <Button variant="outline" className="w-full rounded-lg" onClick={() => setViewProduct(null)}>Close</Button>
          </div>
        </div>
      </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Seller</th><th className="px-4 py-3">Rating</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <div className="font-medium">{p.name}</div>
                      {p.badge && <span className="text-xs text-primary font-medium">{p.badge}</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{formatFRW(p.price)}</p>
                    {p.originalPrice && <p className="text-xs text-muted-foreground line-through">{formatFRW(p.originalPrice)}</p>}
                  </div>
                </td>
                <td className="px-4 py-3">{p.stock || 0}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{p.seller}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-warning fill-warning" />
                    <span className="text-xs">{p.rating}</span>
                    <span className="text-xs text-muted-foreground">({p.reviews})</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setViewProduct(p)}><Eye size={14} /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(p)}><Edit size={14} /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p._id)}><Trash2 size={14} /></Button>
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

export default AdminProducts;
