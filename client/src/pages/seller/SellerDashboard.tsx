import React, { useState, useEffect } from "react";
import { Package, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatFRW } from "@/lib/currency";
import { sellerAPI } from "@/services/sellerAPI";
import { toast } from "sonner";

interface DashboardStats {
  totalProducts: number;
  totalRevenue: number;
  totalOrders: number;
  conversionRate: string;
  productsGrowth: string;
  revenueGrowth: string;
  ordersGrowth: string;
  conversionGrowth: string;
}

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

const SellerDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalRevenue: 0,
    totalOrders: 0,
    conversionRate: '0%',
    productsGrowth: '0%',
    revenueGrowth: '0%',
    ordersGrowth: '0%',
    conversionGrowth: '0%'
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const dashboardResponse = await sellerAPI.getDashboardStats();
      const salesResponse = await sellerAPI.getSalesData('30d');

      // Update stats
      setStats({
        totalProducts: dashboardResponse.totalProducts || 0,
        totalRevenue: dashboardResponse.totalRevenue || 0,
        totalOrders: dashboardResponse.totalOrders || 0,
        conversionRate: dashboardResponse.conversionRate || '0%',
        productsGrowth: dashboardResponse.productsGrowth || '0%',
        revenueGrowth: dashboardResponse.revenueGrowth || '0%',
        ordersGrowth: dashboardResponse.ordersGrowth || '0%',
        conversionGrowth: dashboardResponse.conversionGrowth || '0%'
      });

      // Update monthly data
      setMonthlyData(salesResponse.monthlySales || []);
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
        <h1 className="font-heading text-2xl font-bold">Store Dashboard</h1>
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
      <h1 className="font-heading text-2xl font-bold">Store Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Products" value={stats.totalProducts.toLocaleString()} icon={Package} trend={stats.productsGrowth} trendUp />
        <StatCard title="Revenue" value={formatFRW(stats.totalRevenue)} icon={DollarSign} trend={stats.revenueGrowth} trendUp />
        <StatCard title="Orders" value={stats.totalOrders.toLocaleString()} icon={ShoppingCart} trend={stats.ordersGrowth} trendUp />
        <StatCard title="Conversion" value={stats.conversionRate} icon={TrendingUp} trend={stats.conversionGrowth} trendUp />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-heading text-lg font-semibold">Monthly Revenue</h2>
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
    </div>
  );
};

export default SellerDashboard;
