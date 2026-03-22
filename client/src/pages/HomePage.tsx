import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Truck, Shield, Headphones, ChevronLeft, ChevronRight, Zap, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/shared/ProductCard";
import CategoryCard from "@/components/shared/CategoryCard";
import { products, categories, testimonials, deals } from "@/data/mock";
import { formatFRW } from "@/lib/currency";
import ApiTest from "@/components/ApiTest";

const HomePage = () => {
  const [currentDeal, setCurrentDeal] = useState(0);
  const [countdown, setCountdown] = useState({ h: 5, m: 42, s: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const auto = setInterval(() => setCurrentDeal(p => (p + 1) % deals.length), 5000);
    return () => clearInterval(auto);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div>
      {/* Hero Carousel */}
      <section className="relative overflow-hidden bg-gradient-dark">
        <div className="container mx-auto grid items-center gap-8 px-4 py-12 md:py-16 lg:grid-cols-2">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Zap size={12} /> New Season Collection
            </span>
            <h1 className="mt-4 font-heading text-3xl font-bold leading-[1.1] tracking-tight text-primary-foreground sm:text-4xl md:text-5xl" style={{ lineHeight: 1.1 }}>
              Discover Products You'll Love
            </h1>
            <p className="mt-4 text-base text-primary-foreground/65 leading-relaxed max-w-md">
              Shop from thousands of independent sellers. Quality products, competitive prices, delivered to your door.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/products">
                <Button size="lg" className="gap-2 rounded-xl bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 transition-all active:scale-[0.97]">
                  Shop Now <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/register?role=seller">
                <Button size="lg" variant="outline" className="rounded-xl border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 transition-all active:scale-[0.97]">
                  Start Selling
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              {deals.map((deal, i) => (
                <Link key={deal.id} to={deal.link} className={`block transition-all duration-500 ${i === currentDeal ? "opacity-100" : "hidden opacity-0"}`}>
                  <div className="relative aspect-[3/2] overflow-hidden rounded-2xl">
                    <img src={deal.image} alt={deal.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-sm font-medium text-white/80">{deal.subtitle}</p>
                      <h3 className="mt-1 font-heading text-2xl font-bold text-white">{deal.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-3 flex justify-center gap-2">
              {deals.map((_, i) => (
                <button key={i} onClick={() => setCurrentDeal(i)} className={`h-1.5 rounded-full transition-all ${i === currentDeal ? "w-6 bg-primary" : "w-1.5 bg-primary-foreground/30"}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5">
                <Zap size={14} className="text-destructive" />
                <span className="text-sm font-bold text-destructive">Flash Deals</span>
              </div>
              <div className="hidden items-center gap-1 sm:flex">
                <Clock size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Ends in</span>
                {[pad(countdown.h), pad(countdown.m), pad(countdown.s)].map((v, i) => (
                  <React.Fragment key={i}>
                    <span className="rounded-md bg-foreground px-1.5 py-0.5 text-xs font-bold tabular-nums text-background">{v}</span>
                    {i < 2 && <span className="text-xs text-muted-foreground">:</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <Link to="/products" className="text-sm font-medium text-primary hover:underline">View All →</Link>
          </div>
          <div className="mt-5 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {products.filter(p => p.originalPrice).slice(0, 6).map(p => (
              <Link key={p.id} to={`/products/${p.id}`} className="group rounded-xl border border-border bg-card p-3 shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                  <span className="absolute left-1.5 top-1.5 rounded bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                    -{Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100)}%
                  </span>
                </div>
                <p className="mt-2 line-clamp-1 text-xs font-medium">{p.name}</p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-destructive">{formatFRW(p.price)}</span>
                  <span className="text-[10px] text-muted-foreground line-through">{formatFRW(p.originalPrice!)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold sm:text-2xl">Shop by Category</h2>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline">View All →</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map(cat => <CategoryCard key={cat.id} {...cat} />)}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-secondary/40 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              <h2 className="font-heading text-xl font-bold sm:text-2xl">Trending Now</h2>
            </div>
            <Link to="/products" className="text-sm font-medium text-primary hover:underline">View All →</Link>
          </div>
          <div className="mt-6 grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.slice(0, 4).map(p => <ProductCard key={p.id} {...p} />)}
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="font-heading text-xl font-bold sm:text-2xl">Latest Arrivals</h2>
        <div className="mt-6 grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(4, 12).map(p => <ProductCard key={p.id} {...p} />)}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-dark py-14">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-xl font-bold text-primary-foreground text-center sm:text-2xl">What Our Community Says</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map(t => (
              <div key={t.id} className="rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={12} className="fill-warning text-warning" />)}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-sidebar-foreground/75">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-sidebar-foreground">{t.name}</p>
                    <p className="text-[11px] text-sidebar-foreground/50">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-14 text-center">
        <h2 className="font-heading text-xl font-bold sm:text-2xl">Ready to Start Selling?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Join thousands of sellers and reach millions of buyers worldwide.</p>
        <Link to="/register?role=seller">
          <Button size="lg" className="mt-5 rounded-xl bg-gradient-hero shadow-glow hover:opacity-90 transition-all active:scale-[0.97]">
            Create Your Store
          </Button>
        </Link>
      </section>

      {/* API Test Section */}
      <section className="container mx-auto px-4 py-8">
        <ApiTest />
      </section>
    </div>
  );
};

export default HomePage;
