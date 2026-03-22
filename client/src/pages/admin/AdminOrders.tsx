import React, { useState, useEffect } from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import { toast } from "sonner";
import { formatFRW } from "@/lib/currency";
import { adminAPI } from "@/services/adminAPI";

interface Order {
  _id: string;
  orderNumber: string;
  buyer: {
    _id: string;
    name: string;
    email: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
      image: string;
    };
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Order['status']) => {
    try {
      await adminAPI.updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      toast.success(`Order ${id} → ${status}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading orders...</div>;
  }

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-bold">Orders Management</h1>
      <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="px-4 py-3">Order</th><th className="px-4 py-3">Buyer</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Items</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Action</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium">{o.buyer.name}</div>
                    <div className="text-xs text-muted-foreground">{o.buyer.email}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">{o.items.length}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-right font-medium">{formatFRW(o.total)}</td>
                <td className="px-4 py-3">
                  <select 
                    value={o.status} 
                    onChange={(e) => updateStatus(o._id, e.target.value as Order['status'])}
                    className="text-xs border border-border rounded px-2 py-1 bg-background"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
