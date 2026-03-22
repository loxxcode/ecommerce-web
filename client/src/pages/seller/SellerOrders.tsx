import React, { useState } from "react";
import { orders as initialOrders } from "@/data/mock";
import StatusBadge from "@/components/shared/StatusBadge";
import { toast } from "sonner";
import { formatFRW } from "@/lib/currency";

const SellerOrders = () => {
  const [orderList, setOrderList] = useState(initialOrders);

  const updateStatus = (id: string, status: string) => {
    setOrderList(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    toast.success(`Order ${id} updated to ${status}`);
  };

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-bold">Orders</h1>
      <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="px-4 py-3">Order</th><th className="px-4 py-3">Buyer</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Update</th></tr></thead>
          <tbody>
            {orderList.map(o => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 font-medium">{o.id}</td>
                <td className="px-4 py-3">{o.buyer}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{o.date}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-right font-medium">{formatFRW(o.total)}</td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={e => updateStatus(o.id, e.target.value)}
                    className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring/30"
                  >
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

export default SellerOrders;
