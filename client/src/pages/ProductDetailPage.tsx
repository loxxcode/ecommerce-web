import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ShoppingCart, Heart, Truck, Shield, ArrowLeft, Minus, Plus, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import ProductCard from "@/components/shared/ProductCard";
import { products } from "@/data/mock";
import { toast } from "sonner";
import { formatFRW } from "@/lib/currency";

const ProductDetailPage = () => {
  const { id } = useParams();
  const product = products.find(p => p.id === id) || products[0];
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");
  const wishlisted = isInWishlist(product.id);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem({ id: product.id, name: product.name, price: product.price, image: product.image, seller: product.seller });
    toast.success(`Added ${qty} item${qty > 1 ? "s" : ""} to cart`, { description: product.name });
  };

  const handleBuyNow = () => {
    handleAddToCart();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-foreground transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[150px]">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="sticky top-24">
          <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover aspect-square" />
          </div>
        </div>

        <div>
          <p className="text-sm text-primary font-medium">{product.seller}</p>
          <h1 className="mt-1 font-heading text-2xl font-bold md:text-3xl" style={{ lineHeight: 1.15 }}>{product.name}</h1>

          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < Math.floor(product.rating) ? "fill-warning text-warning" : "text-border"} />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            <span className="text-sm text-muted-foreground">|</span>
            <span className="text-sm text-success font-medium">In Stock ({product.stock})</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            {discount > 0 && (
              <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-sm font-bold text-destructive">-{discount}%</span>
            )}
            <span className="font-heading text-3xl font-bold">{formatFRW(product.price)}</span>
            {product.originalPrice && <span className="text-lg text-muted-foreground line-through">{formatFRW(product.originalPrice)}</span>}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {product.description || `Premium quality product from ${product.seller}. This product features exceptional craftsmanship, durable materials, and modern design.`}
          </p>

          <div className="my-6 h-px bg-border" />

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Quantity</span>
            <div className="flex items-center rounded-lg border border-input overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors active:scale-95"><Minus size={14} /></button>
              <span className="w-12 text-center text-sm font-semibold tabular-nums border-x border-input py-2">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock || 99, qty + 1))} className="px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors active:scale-95"><Plus size={14} /></button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Button size="lg" className="flex-1 gap-2 rounded-xl bg-primary hover:bg-primary/90 transition-all active:scale-[0.97]" onClick={handleBuyNow}>
              Buy Now
            </Button>
            <Button size="lg" variant="outline" className="flex-1 gap-2 rounded-xl transition-all active:scale-[0.97]" onClick={handleAddToCart}>
              <ShoppingCart size={16} /> Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={`rounded-xl transition-all active:scale-[0.97] ${wishlisted ? "border-destructive text-destructive" : ""}`}
              onClick={() => { toggleWishlist(product.id); toast(wishlisted ? "Removed from wishlist" : "Added to wishlist"); }}
            >
              <Heart size={16} className={wishlisted ? "fill-current" : ""} />
            </Button>
            <Button size="lg" variant="ghost" className="rounded-xl" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}>
              <Share2 size={16} />
            </Button>
          </div>

          {/* Features */}
          <div className="mt-6 space-y-2.5">
            {[
              { icon: Truck, text: "Free shipping on orders over FRW 50,000" },
              { icon: Shield, text: "30-day hassle-free returns" },
              { icon: Check, text: "Authentic product guarantee" },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-2.5 text-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon size={14} className="text-primary" />
                </div>
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="flex border-b border-border">
          {(["description", "reviews"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {tab} {tab === "reviews" && `(${product.reviews})`}
            </button>
          ))}
        </div>
        <div className="py-6">
          {activeTab === "description" && (
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>{product.description || "No additional description available."}</p>
              <h4 className="text-foreground mt-4 font-heading font-semibold">Features</h4>
              <ul className="space-y-1">
                <li>Premium quality materials</li>
                <li>Modern and sleek design</li>
                <li>Durable construction</li>
                <li>Easy to use and maintain</li>
              </ul>
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {[
                { name: "Alex R.", rating: 5, text: "Absolutely love this product! Quality exceeds expectations.", date: "3 days ago" },
                { name: "Maria L.", rating: 4, text: "Great value for the price. Would recommend to others.", date: "1 week ago" },
                { name: "Chris P.", rating: 5, text: "Fast shipping, perfect condition. Will buy again!", date: "2 weeks ago" },
              ].map((review, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{review.name[0]}</div>
                      <span className="text-sm font-medium">{review.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="mt-2 flex gap-0.5">
                    {Array.from({ length: review.rating }).map((_, i) => <Star key={i} size={12} className="fill-warning text-warning" />)}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{review.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-8 border-t border-border pt-8">
          <h2 className="font-heading text-xl font-bold">Customers Also Bought</h2>
          <div className="mt-5 grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {related.map(p => <ProductCard key={p.id} {...p} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
