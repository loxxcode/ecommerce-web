import React from "react";
import { Link } from "react-router-dom";
import { CreditCard, Truck, Shield, Headphones } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    {/* Features bar */}
    <div className="border-b border-border bg-secondary/30">
      <div className="container mx-auto grid grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-4">
        {[
          { icon: Truck, title: "Free Shipping", desc: "On orders $50+" },
          { icon: Shield, title: "Buyer Protection", desc: "Secure transactions" },
          { icon: CreditCard, title: "Safe Payment", desc: "100% secure checkout" },
          { icon: Headphones, title: "24/7 Support", desc: "Dedicated help center" },
        ].map(f => (
          <div key={f.title} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <f.icon size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="container mx-auto px-4 py-10">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero">
              <span className="text-lg font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-heading text-xl font-bold">Marktora</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground leading-relaxed">
            Your trusted multi-vendor marketplace. Discover unique products from thousands of independent sellers worldwide.
          </p>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold">Shop</h4>
          <div className="mt-3 flex flex-col gap-2">
            <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">All Products</Link>
            <Link to="/products?category=Electronics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Electronics</Link>
            <Link to="/products?category=Fashion" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Fashion</Link>
            <Link to="/products?category=Sports" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sports</Link>
          </div>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold">Account</h4>
          <div className="mt-3 flex flex-col gap-2">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Create Account</Link>
            <Link to="/register?role=seller" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sell on Marktora</Link>
            <Link to="/dashboard/orders" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Track Orders</Link>
          </div>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold">Help</h4>
          <div className="mt-3 flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Help Center</span>
            <span className="text-sm text-muted-foreground">Shipping Info</span>
            <span className="text-sm text-muted-foreground">Returns & Refunds</span>
            <span className="text-sm text-muted-foreground">Contact Us</span>
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
        <p className="text-xs text-muted-foreground">© 2024 Marktora. All rights reserved.</p>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Cookie Settings</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
