import React, { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, SlidersHorizontal, Grid3X3, LayoutList, X } from "lucide-react";
import ProductCard from "@/components/shared/ProductCard";
import { products, categories } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { formatFRW } from "@/lib/currency";

const priceRanges = [
  { label: "Under FRW 50,000", min: 0, max: 50000 },
  { label: "FRW 50,000 - 100,000", min: 50000, max: 100000 },
  { label: "FRW 100,000 - 250,000", min: 100000, max: 250000 },
  { label: "FRW 250,000 - 500,000", min: 250000, max: 500000 },
  { label: "FRW 500,000+", min: 500000, max: Infinity },
];

const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState<number | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = activeCategory === "All" ? [...products] : products.filter(p => p.category === activeCategory);
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.seller.toLowerCase().includes(search.toLowerCase()));
    if (priceRange !== null) {
      const range = priceRanges[priceRange];
      list = list.filter(p => p.price >= range.min && p.price < range.max);
    }
    if (minRating > 0) list = list.filter(p => p.rating >= minRating);
    if (sortBy === "price-low") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") list.sort((a, b) => b.price - a.price);
    if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    if (sortBy === "newest") list.reverse();
    return list;
  }, [activeCategory, search, sortBy, priceRange, minRating]);

  const clearFilters = () => {
    setSearch("");
    setPriceRange(null);
    setMinRating(0);
    setSortBy("featured");
    searchParams.delete("category");
    searchParams.delete("search");
    setSearchParams(searchParams);
  };

  const hasActiveFilters = search || priceRange !== null || minRating > 0 || activeCategory !== "All";

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{activeCategory === "All" ? "All Products" : activeCategory}</span>
      </nav>

      <div className="flex items-start gap-6">
        {/* Sidebar filters (desktop) */}
        <aside className={`${showFilters ? "fixed inset-0 z-50 bg-background p-4 overflow-y-auto lg:static lg:bg-transparent lg:p-0" : "hidden"} lg:block w-full lg:w-56 shrink-0 space-y-5`}>
          <div className="flex items-center justify-between lg:hidden">
            <h3 className="font-heading text-lg font-bold">Filters</h3>
            <button onClick={() => setShowFilters(false)}><X size={20} /></button>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Category</h4>
            <div className="space-y-1">
              {["All", ...categories.map(c => c.name)].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    if (cat === "All") { searchParams.delete("category"); }
                    else { searchParams.set("category", cat); }
                    setSearchParams(searchParams);
                  }}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${activeCategory === cat ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Price Range</h4>
            <div className="space-y-1">
              {priceRanges.map((range, i) => (
                <button
                  key={i}
                  onClick={() => setPriceRange(priceRange === i ? null : i)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${priceRange === i ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Minimum Rating</h4>
            <div className="space-y-1">
              {[4, 3, 2].map(r => (
                <button
                  key={r}
                  onClick={() => setMinRating(minRating === r ? 0 : r)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${minRating === r ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  {"⭐".repeat(r)} & up
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" className="w-full rounded-lg text-xs" onClick={clearFilters}>Clear All Filters</Button>
          )}
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search in results..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-lg border border-input bg-card py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/30 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="lg:hidden gap-1.5" onClick={() => setShowFilters(true)}>
                <SlidersHorizontal size={14} /> Filters
              </Button>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="rounded-lg border border-input bg-card px-3 py-2 text-xs outline-none">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
              </select>
              <div className="hidden sm:flex rounded-lg border border-input overflow-hidden">
                <button onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"} transition-colors`}>
                  <Grid3X3 size={14} />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-2 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"} transition-colors`}>
                  <LayoutList size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Results count & active filters */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</span>
            {activeCategory !== "All" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {activeCategory}
                <button onClick={() => { searchParams.delete("category"); setSearchParams(searchParams); }} className="hover:text-destructive"><X size={10} /></button>
              </span>
            )}
            {priceRange !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {priceRanges[priceRange].label}
                <button onClick={() => setPriceRange(null)} className="hover:text-destructive"><X size={10} /></button>
              </span>
            )}
          </div>

          {/* Grid */}
          <div className={`mt-4 grid gap-3 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}>
            {filtered.map(p => <ProductCard key={p.id} {...p} />)}
          </div>
          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search terms.</p>
              <Button variant="outline" className="mt-4 rounded-lg" onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;
