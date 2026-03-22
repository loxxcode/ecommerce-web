import React from "react";
import { Star, ShoppingCart, Heart, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatFRW } from "@/lib/currency";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  seller: string;
  badge?: string | null;
  stock?: number;
}

const ProductCard = ({ id, name, price, originalPrice, rating, reviews, image, seller, badge, stock }: ProductCardProps) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const wishlisted = isInWishlist(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, name, price, image, seller });
    toast.success("Added to cart", { description: name });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist", { description: name });
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5">
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button
          onClick={handleToggleWishlist}
          className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-all ${wishlisted ? "bg-destructive text-destructive-foreground" : "bg-card/90 text-muted-foreground hover:bg-card hover:text-destructive"}`}
        >
          <Heart size={14} className={wishlisted ? "fill-current" : ""} />
        </button>
        <Link
          to={`/products/${id}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-card/90 shadow-sm backdrop-blur-sm text-muted-foreground hover:bg-card hover:text-foreground transition-all"
        >
          <Eye size={14} />
        </Link>
      </div>

      <Link to={`/products/${id}`} className="block overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img src={image} alt={name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108" loading="lazy" />
          {badge && (
            <span className="absolute left-2.5 top-2.5 rounded-md bg-gradient-hero px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
              {badge}
            </span>
          )}
          {discount > 0 && !badge && (
            <span className="absolute left-2.5 top-2.5 rounded-md bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground shadow-sm">
              -{discount}%
            </span>
          )}
          {stock !== undefined && stock < 20 && stock > 0 && (
            <span className="absolute bottom-2.5 left-2.5 rounded-md bg-warning/90 px-2 py-0.5 text-[10px] font-bold text-warning-foreground shadow-sm">
              Only {stock} left
            </span>
          )}
        </div>
      </Link>

      <div className="p-3.5">
        <p className="text-[11px] font-medium text-muted-foreground">{seller}</p>
        <Link to={`/products/${id}`}>
          <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-card-foreground transition-colors hover:text-primary">{name}</h3>
        </Link>
        <div className="mt-1.5 flex items-center gap-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={11} className={i < Math.floor(rating) ? "fill-warning text-warning" : "text-border"} />
            ))}
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">({reviews.toLocaleString()})</span>
        </div>
        <div className="mt-2.5 flex items-end justify-between">
          <div>
            <span className="text-sm font-bold text-card-foreground">{formatFRW(price)}</span>
            {originalPrice && (
              <span className="ml-1.5 text-[10px] text-muted-foreground line-through">{formatFRW(originalPrice)}</span>
            )}
          </div>
          <Button
            size="icon"
            className="h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
