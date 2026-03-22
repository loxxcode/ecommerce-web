import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Menu, X, User, LogOut, ChevronDown, Heart, Package, LayoutDashboard, Store, Shield, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { products, categories } from "@/data/mock";

const Navbar = () => {
  const { user, role, logout, switchRole } = useAuth();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof products>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const accountRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const isDashboard = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/seller") || location.pathname.startsWith("/admin");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      setSearchResults(products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
      setSearchQuery("");
    }
  };

  const dashboardLink = role === "admin" ? "/admin" : role === "seller" ? "/seller" : "/dashboard";

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-lg">
      {/* Top promotional bar */}
      <div className="bg-gradient-dark text-center text-xs text-primary-foreground/80 py-1.5 px-4">
        <span>🔥 Free shipping on orders over $50 · <Link to="/products" className="underline font-medium text-primary-foreground">Shop Now</Link></span>
      </div>

      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        {/* Mobile menu btn */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-secondary lg:hidden">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-sm">
            <span className="text-lg font-bold text-primary-foreground">M</span>
          </div>
          <span className="font-heading text-xl font-bold hidden sm:block">Marktora</span>
        </Link>

        {/* Delivery hint (desktop) */}
        {!isDashboard && (
          <button className="hidden xl:flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors">
            <MapPin size={14} className="text-primary" />
            <div className="text-left">
              <span className="text-muted-foreground block leading-none">Deliver to</span>
              <span className="font-medium leading-none">Your Location</span>
            </div>
          </button>
        )}

        {/* Search bar (desktop) */}
        {!isDashboard && (
          <div ref={searchRef} className="relative hidden flex-1 md:block max-w-2xl">
            <form onSubmit={handleSearch} className="flex">
              <select className="rounded-l-lg border border-r-0 border-input bg-secondary px-3 py-2.5 text-xs font-medium text-muted-foreground outline-none">
                <option>All</option>
                {categories.map(c => <option key={c.id}>{c.name}</option>)}
              </select>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search products, brands, sellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="w-full border border-input bg-background py-2.5 px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <button type="submit" className="rounded-r-lg bg-primary px-4 text-primary-foreground hover:bg-primary/90 transition-colors">
                <Search size={18} />
              </button>
            </form>

            {/* Search dropdown */}
            {searchFocused && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-border bg-card p-2 shadow-elevated z-50">
                {searchResults.map(p => (
                  <Link
                    key={p.id}
                    to={`/products/${p.id}`}
                    onClick={() => { setSearchFocused(false); setSearchQuery(""); }}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary transition-colors"
                  >
                    <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">${p.price} · {p.seller}</p>
                    </div>
                  </Link>
                ))}
                <button
                  onClick={handleSearch as any}
                  className="mt-1 w-full rounded-lg p-2 text-center text-xs font-medium text-primary hover:bg-secondary transition-colors"
                >
                  See all results for "{searchQuery}"
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          {/* Account */}
          <div ref={accountRef} className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-secondary"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {user.name[0]}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="block text-[10px] leading-none text-muted-foreground">Hello, {user.name.split(" ")[0]}</span>
                    <span className="block text-xs font-semibold leading-tight">Account ▾</span>
                  </div>
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-elevated z-50">
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Link to={dashboardLink} onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-secondary transition-colors">
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <Link to="/dashboard/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-secondary transition-colors">
                      <Package size={15} /> Orders
                    </Link>
                    <Link to="/dashboard/wishlist" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-secondary transition-colors">
                      <Heart size={15} /> Wishlist
                    </Link>
                    <div className="border-t border-border my-1" />
                    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Switch Role</p>
                    <button onClick={() => { switchRole("buyer"); setAccountOpen(false); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-secondary transition-colors">
                      <User size={15} /> Buyer
                    </button>
                    <button onClick={() => { switchRole("seller"); setAccountOpen(false); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-secondary transition-colors">
                      <Store size={15} /> Seller
                    </button>
                    <button onClick={() => { switchRole("admin"); setAccountOpen(false); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-secondary transition-colors">
                      <Shield size={15} /> Admin
                    </button>
                    <div className="border-t border-border my-1" />
                    <button onClick={() => { logout(); setAccountOpen(false); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-secondary">
                <User size={20} />
                <div className="hidden sm:block text-left">
                  <span className="block text-[10px] leading-none text-muted-foreground">Hello, Sign in</span>
                  <span className="block text-xs font-semibold leading-tight">Account</span>
                </div>
              </Link>
            )}
          </div>

          {/* Wishlist */}
          <Link to="/dashboard/wishlist" className="relative flex flex-col items-center rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary">
            <Heart size={20} className="text-muted-foreground" />
            {wishCount > 0 && (
              <span className="absolute -right-0.5 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {wishCount}
              </span>
            )}
            <span className="hidden sm:block text-[10px] leading-tight text-muted-foreground mt-0.5">Wishlist</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary">
            <div className="relative">
              <ShoppingCart size={22} className="text-foreground" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </div>
            <span className="hidden sm:block text-xs font-semibold ml-1">Cart</span>
          </Link>
        </div>
      </div>

      {/* Category bar (desktop) */}
      {!isDashboard && (
        <div className="border-t border-border bg-card/50">
          <div className="container mx-auto flex items-center gap-1 px-4 overflow-x-auto scrollbar-hide">
            <Link to="/products" className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-medium hover:text-primary transition-colors">
              <Menu size={14} /> All
            </Link>
            {categories.map(c => (
              <Link key={c.id} to={`/products?category=${encodeURIComponent(c.name)}`} className="shrink-0 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                {c.name}
              </Link>
            ))}
            <Link to="/register?role=seller" className="shrink-0 px-3 py-2 text-xs font-medium text-primary hover:underline ml-auto">
              Sell on Marktora
            </Link>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card p-4 lg:hidden space-y-3">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="flex rounded-lg border border-input overflow-hidden">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-background px-3 py-2.5 text-sm outline-none"
            />
            <button type="submit" className="bg-primary px-3 text-primary-foreground"><Search size={16} /></button>
          </form>
          <div className="flex flex-col gap-1">
            {categories.map(c => (
              <Link key={c.id} to={`/products?category=${encodeURIComponent(c.name)}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary transition-colors">
                <span>{c.icon}</span> {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
