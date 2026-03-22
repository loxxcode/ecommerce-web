import React, { useState, useEffect } from "react";
import { Users, Store, Package, DollarSign } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatFRW } from "@/lib/currency";
import { adminAPI } from "@/services/adminAPI";
import { toast } from "sonner";

interface DashboardStats {
  totalBuyers: number;
  activeSellers: number;
  totalProducts: number;
  totalRevenue: number;
  buyerGrowth: string;
  newSellers: string;
  newProducts: string;
  revenueGrowth: string;
}

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBuyers: 0,
    activeSellers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    buyerGrowth: '0%',
    newSellers: '0',
    newProducts: '0',
    revenueGrowth: '0%'
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics data
      const analyticsResponse = await adminAPI.getAnalytics();
      const userStats = await adminAPI.getUserStats();
      const productStats = await adminAPI.getProductStats();
      const salesData = await adminAPI.getSalesData();

      // Update stats
      setStats({
        totalBuyers: userStats.totalBuyers || 0,
        activeSellers: userStats.activeSellers || 0,
        totalProducts: productStats.totalProducts || 0,
        totalRevenue: analyticsResponse.totalRevenue || 0,
        buyerGrowth: userStats.growth || '0%',
        newSellers: userStats.newSellers || '0',
        newProducts: productStats.newProducts || '0',
        revenueGrowth: analyticsResponse.revenueGrowth || '0%'
      });

      // Update monthly data
      setMonthlyData(salesData.monthlySales || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <h1 className="font-heading text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in space-y-6">
    <h1 className="font-heading text-2xl font-bold">Admin Dashboard</h1>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Buyers" value={stats.totalBuyers.toLocaleString()} icon={Users} trend={stats.buyerGrowth} trendUp />
      <StatCard title="Active Sellers" value={stats.activeSellers.toLocaleString()} icon={Store} trend={`${stats.newSellers} new`} trendUp />
      <StatCard title="Products" value={stats.totalProducts.toLocaleString()} icon={Package} trend={`${stats.newProducts} new`} trendUp />
      <StatCard title="Revenue" value={formatFRW(stats.totalRevenue)} icon={DollarSign} trend={stats.revenueGrowth} trendUp />
    </div>

    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h2 className="font-heading text-lg font-semibold">Platform Revenue</h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} formatter={(value: number) => [formatFRW(value), "Revenue"]} />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h2 className="font-heading text-lg font-semibold">Recent Orders</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="pb-3">Order</th><th className="pb-3">Buyer</th><th className="pb-3">Date</th><th className="pb-3">Status</th><th className="pb-3 text-right">Total</th></tr></thead>
          <tbody>
            {monthlyData.slice(0, 5).map((o, index) => (
              <tr key={index} className="border-b border-border last:border-0">
                <td className="py-3 font-medium">#{index + 1000}</td>
                <td className="py-3">Customer {index + 1}</td>
                <td className="py-3 text-muted-foreground">{o.month}</td>
                <td className="py-3"><StatusBadge status="completed" /></td>
                <td className="py-3 text-right font-medium">{formatFRW(o.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
};

export default AdminDashboard;
