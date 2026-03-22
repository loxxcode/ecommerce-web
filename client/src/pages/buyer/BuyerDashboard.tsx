import React from "react";
import { ShoppingBag, Heart, Package, TrendingUp } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import { orders, products } from "@/data/mock";
import StatusBadge from "@/components/shared/StatusBadge";
import { Link } from "react-router-dom";
import { formatFRW } from "@/lib/currency";

const BuyerDashboard = () => (
  <div className="animate-fade-in space-y-6">
    <h1 className="font-heading text-2xl font-bold">My Dashboard</h1>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Orders" value={orders.length} icon={Package} trend="2 this month" trendUp />
      <StatCard title="Wishlist" value={4} icon={Heart} />
      <StatCard title="Cart Items" value={2} icon={ShoppingBag} />
      <StatCard title="Spent" value={formatFRW(1590000)} icon={TrendingUp} trend="12% vs last month" trendUp />
    </div>

    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h2 className="font-heading text-lg font-semibold">Recent Orders</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="pb-3">Order</th><th className="pb-3">Date</th><th className="pb-3">Status</th><th className="pb-3 text-right">Total</th></tr></thead>
          <tbody>
            {orders.slice(0, 4).map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0">
                <td className="py-3 font-medium">{o.id}</td>
                <td className="py-3 text-muted-foreground">{o.date}</td>
                <td className="py-3"><StatusBadge status={o.status} /></td>
                <td className="py-3 text-right font-medium">{formatFRW(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <h2 className="font-heading text-lg font-semibold">Recommended for You</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map((p) => (
          <Link key={p.id} to={`/products/${p.id}`} className="flex gap-3 rounded-xl border border-border bg-card p-3 shadow-card hover:shadow-elevated transition-shadow">
            <img src={p.image} alt={p.name} className="h-16 w-16 rounded-lg object-cover" />
            <div><p className="text-sm font-medium line-clamp-2">{p.name}</p><p className="mt-1 text-sm font-bold">{formatFRW(p.price)}</p></div>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default BuyerDashboard;
