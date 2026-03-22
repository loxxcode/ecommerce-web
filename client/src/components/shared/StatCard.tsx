import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp, className }: StatCardProps) => (
  <div className={cn("rounded-xl border border-border bg-card p-5 shadow-card", className)}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 font-heading text-2xl font-bold">{value}</p>
        {trend && (
          <p className={cn("mt-1 text-xs font-medium", trendUp ? "text-success" : "text-destructive")}>
            {trendUp ? "↑" : "↓"} {trend}
          </p>
        )}
      </div>
      <div className="rounded-lg bg-primary/10 p-2.5">
        <Icon size={20} className="text-primary" />
      </div>
    </div>
  </div>
);

export default StatCard;
