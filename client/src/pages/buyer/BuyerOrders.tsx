import React, { useState } from "react";
import { orders } from "@/data/mock";
import StatusBadge from "@/components/shared/StatusBadge";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { formatFRW } from "@/lib/currency";

const BuyerOrders = () => {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = statusFilter === "all" ? orders : orders.filter(o => o.status === statusFilter);

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-bold">My Orders</h1>

      <div className="flex gap-2 flex-wrap">
        {["all", "processing", "shipped", "delivered", "cancelled"].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(o => (
          <div key={o.id} className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <button
              onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-heading font-semibold text-sm">{o.id}</span>
                <span className="text-xs text-muted-foreground">{o.date}</span>
                <StatusBadge status={o.status} />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-heading font-bold text-sm">{formatFRW(o.total)}</span>
                {expandedOrder === o.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>
            {expandedOrder === o.id && (
              <div className="border-t border-border p-4 bg-secondary/20">
                <p className="text-xs font-medium text-muted-foreground mb-2">Items in this order:</p>
                <div className="space-y-2">
                  {o.products.map((name, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Package size={14} className="text-muted-foreground" />
                      {name}
                    </div>
                  ))}
                </div>
                {o.status !== "cancelled" && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Tracking:</p>
                    <div className="flex items-center gap-2">
                      {["processing", "shipped", "delivered"].map((step, i) => {
                        const steps = ["processing", "shipped", "delivered"];
                        const currentIdx = steps.indexOf(o.status);
                        const active = i <= currentIdx;
                        return (
                          <React.Fragment key={step}>
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{i + 1}</div>
                            {i < 2 && <div className={`h-0.5 w-8 ${i < currentIdx ? "bg-primary" : "bg-border"}`} />}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 mt-1 ml-0.5">
                      {["Processing", "Shipped", "Delivered"].map(s => (
                        <span key={s} className="text-[10px] text-muted-foreground w-[calc(7*0.25rem+2rem)]">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="py-12 text-center text-muted-foreground">No orders found.</p>}
      </div>
    </div>
  );
};

export default BuyerOrders;
