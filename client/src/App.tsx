import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import PublicLayout from "@/components/layout/PublicLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public pages
import HomePage from "@/pages/HomePage";
import ProductListingPage from "@/pages/ProductListingPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import SellerPendingPage from "@/pages/SellerPendingPage";
import NotFound from "@/pages/NotFound";

// Buyer pages
import BuyerDashboard from "@/pages/buyer/BuyerDashboard";
import BuyerOrders from "@/pages/buyer/BuyerOrders";
import BuyerWishlist from "@/pages/buyer/BuyerWishlist";
import BuyerProfile from "@/pages/buyer/BuyerProfile";

// Seller pages
import SellerDashboard from "@/pages/seller/SellerDashboard";
import SellerProducts from "@/pages/seller/SellerProducts";
import SellerOrders from "@/pages/seller/SellerOrders";
import SellerAnalytics from "@/pages/seller/SellerAnalytics";
import SellerProfile from "@/pages/seller/SellerProfile";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminSellers from "@/pages/admin/AdminSellers";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminSettings from "@/pages/admin/AdminSettings";

import { LayoutDashboard, Package, ShoppingCart, Heart, User, BarChart3, Store, Users, Settings } from "lucide-react";
import type { SidebarLink } from "@/components/layout/DashboardSidebar";

const buyerLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { label: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

const sellerLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/seller", icon: LayoutDashboard },
  { label: "Products", href: "/seller/products", icon: Package },
  { label: "Orders", href: "/seller/orders", icon: ShoppingCart },
  { label: "Analytics", href: "/seller/analytics", icon: BarChart3 },
  { label: "Profile", href: "/seller/profile", icon: User },
];

const adminLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Sellers", href: "/admin/sellers", icon: Store },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductListingPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/seller-pending" element={<SellerPendingPage />} />
                </Route>

                {/* Buyer Dashboard */}
                <Route element={
                  <ProtectedRoute requiredRole="buyer">
                    <DashboardLayout links={buyerLinks} title="Buyer Panel" />
                  </ProtectedRoute>
                }>
                  <Route path="/dashboard" element={<BuyerDashboard />} />
                  <Route path="/dashboard/orders" element={<BuyerOrders />} />
                  <Route path="/dashboard/wishlist" element={<BuyerWishlist />} />
                  <Route path="/dashboard/profile" element={<BuyerProfile />} />
                </Route>

                {/* Seller Dashboard */}
                <Route element={
                  <ProtectedRoute requiredRole="seller">
                    <DashboardLayout links={sellerLinks} title="Seller Panel" accentClass="bg-seller" />
                  </ProtectedRoute>
                }>
                  <Route path="/seller" element={<SellerDashboard />} />
                  <Route path="/seller/products" element={<SellerProducts />} />
                  <Route path="/seller/orders" element={<SellerOrders />} />
                  <Route path="/seller/analytics" element={<SellerAnalytics />} />
                  <Route path="/seller/profile" element={<SellerProfile />} />
                </Route>

                {/* Admin Dashboard */}
                <Route element={
                  <ProtectedRoute requiredRole="admin">
                    <DashboardLayout links={adminLinks} title="Admin Panel" accentClass="bg-admin" />
                  </ProtectedRoute>
                }>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/sellers" element={<AdminSellers />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
