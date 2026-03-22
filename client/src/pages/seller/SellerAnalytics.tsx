import React from "react";
import { analyticsData } from "@/data/mock";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatFRW } from "@/lib/currency";

const SellerAnalytics = () => (
  <div className="animate-fade-in space-y-6">
    <h1 className="font-heading text-2xl font-bold">Analytics</h1>
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-heading text-base font-semibold">Revenue Trend</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} formatter={(value: number) => [formatFRW(value), "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-heading text-base font-semibold">Orders per Month</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Bar dataKey="orders" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h2 className="font-heading text-base font-semibold">Top Products</h2>
      <div className="mt-4 space-y-3">
        {analyticsData.topProducts.map((p, i) => (
          <div key={p.name} className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
            <span className="flex-1 text-sm font-medium">{p.name}</span>
            <span className="text-sm text-muted-foreground">{p.sales} sales</span>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gradient-hero" style={{ width: `${(p.sales / 312) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SellerAnalytics;
