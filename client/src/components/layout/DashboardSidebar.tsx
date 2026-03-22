import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LucideIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface DashboardSidebarProps {
  links: SidebarLink[];
  title: string;
  accentClass?: string;
  open: boolean;
  onClose: () => void;
}

const DashboardSidebar = ({ links, title, accentClass = "bg-gradient-hero", open, onClose }: DashboardSidebarProps) => {
  const location = useLocation();

  return (
    <>
      {/* Overlay for mobile */}
      {open && <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      <aside className={cn(
        "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:sticky lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", accentClass)}>
              <span className="text-sm font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-heading text-sm font-bold text-sidebar-foreground">{title}</span>
          </Link>
          <button onClick={onClose} className="rounded-md p-1 text-sidebar-foreground/60 hover:text-sidebar-foreground lg:hidden">
            <X size={18} />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-1">
            {links.map((link) => {
              const active = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default DashboardSidebar;
