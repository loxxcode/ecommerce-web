import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import DashboardSidebar, { SidebarLink } from "./DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  links: SidebarLink[];
  title: string;
  accentClass?: string;
}

const DashboardLayout = ({ links, title, accentClass }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar links={links} title={title} accentClass={accentClass} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md">
          <button onClick={() => setSidebarOpen(true)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary lg:hidden">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <button onClick={logout} className="text-sm text-muted-foreground hover:text-destructive">Logout</button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
