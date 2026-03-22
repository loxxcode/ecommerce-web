import React, { useState, useEffect } from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X, Eye, Star, Package, Mail, Calendar, Tag } from "lucide-react";
import { toast } from "sonner";
import { formatFRW } from "@/lib/currency";
import { adminAPI } from "@/services/adminAPI";

interface Seller {
  _id: string;
  name: string;
  email: string;
  storeName: string;
  storeDescription?: string;
  sellerStatus: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  createdAt: string;
  products?: number;
  revenue?: number;
  rating?: number;
}

const AdminSellers = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewSeller, setViewSeller] = useState<Seller | null>(null);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSellers();
      setSellers(response.sellers || []);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      toast.error('Failed to fetch sellers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminAPI.approveSeller(id);
      setSellers(prev => prev.map(s => 
        s._id === id ? { ...s, sellerStatus: 'approved' as const } : s
      ));
      toast.success("Seller approved");
    } catch (error) {
      console.error('Error approving seller:', error);
      toast.error('Failed to approve seller');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminAPI.rejectSeller(id);
      setSellers(prev => prev.map(s => 
        s._id === id ? { ...s, sellerStatus: 'rejected' as const } : s
      ));
      toast("Seller rejected");
    } catch (error) {
      console.error('Error rejecting seller:', error);
      toast.error('Failed to reject seller');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading sellers...</div>;
  }

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-bold">Sellers Management</h1>

      {/* View Seller Modal */}
      {viewSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4" onClick={() => setViewSeller(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-elevated max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img src={(viewSeller as any).logo || "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=200&fit=crop"} alt={viewSeller.name} className="w-full h-40 object-cover rounded-t-2xl" />
              <button className="absolute top-3 right-3 rounded-full bg-card/80 backdrop-blur-sm p-1.5 hover:bg-card transition-colors" onClick={() => setViewSeller(null)}><X size={16} /></button>
              <div className="absolute -bottom-8 left-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg border-4 border-card">
                  {viewSeller.name[0]}
                </div>
              </div>
            </div>
            <div className="p-5 pt-12 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-xl font-bold">{viewSeller.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{viewSeller.email}</p>
                </div>
                <StatusBadge status={viewSeller.sellerStatus} />
              </div>

              {viewSeller.storeDescription && (
                <p className="text-sm text-muted-foreground leading-relaxed">{viewSeller.storeDescription}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
                  <Star size={11} className="text-warning" /> {viewSeller.rating || '0'} rating
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
                  <Package size={11} /> {viewSeller.products || 0} products
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
                  <Calendar size={11} /> Joined {new Date(viewSeller.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                <div className="rounded-lg bg-secondary/50 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Total Revenue</p>
                  <p className="text-sm font-bold mt-0.5 text-primary">{formatFRW(viewSeller.revenue || 0)}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Products Listed</p>
                  <p className="text-sm font-bold mt-0.5">{viewSeller.products || 0}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                {viewSeller.sellerStatus === "pending" && (
                  <>
                    <Button className="flex-1 rounded-lg gap-1.5" onClick={() => { handleApprove(viewSeller._id); setViewSeller(null); }}>
                      <Check size={14} /> Approve
                    </Button>
                    <Button variant="destructive" className="flex-1 rounded-lg gap-1.5" onClick={() => { handleReject(viewSeller._id); setViewSeller(null); }}>
                      <X size={14} /> Reject
                    </Button>
                  </>
                )}
                <Button variant="outline" className={`rounded-lg ${viewSeller.sellerStatus !== "pending" ? "flex-1" : ""}`} onClick={() => setViewSeller(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="px-4 py-3">Seller Names</th><th className="px-4 py-3">Store</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Products</th><th className="px-4 py-3">Revenue</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {sellers.map(s => (
              <tr key={s._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 font-medium">{s.storeName}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{s.email}</td>
                <td className="px-4 py-3">{s.products || 0}</td>
                <td className="px-4 py-3 font-medium">{formatFRW(s.revenue || 0)}</td>
                <td className="px-4 py-3"><StatusBadge status={s.sellerStatus} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setViewSeller(s)}><Eye size={14} /></Button>
                    {s.sellerStatus === "pending" && (
                      <>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-success hover:bg-success/10" onClick={() => handleApprove(s._id)}><Check size={14} /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleReject(s._id)}><X size={14} /></Button>
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

export default AdminSellers;
