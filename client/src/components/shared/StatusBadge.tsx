import React from "react";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  delivered: "bg-success/10 text-success",
  shipped: "bg-info/10 text-info",
  processing: "bg-warning/10 text-warning",
  cancelled: "bg-destructive/10 text-destructive",
  pending: "bg-muted text-muted-foreground",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium capitalize", statusColors[status] || "bg-muted text-muted-foreground")}>
    {status}
  </span>
);

export default StatusBadge;
