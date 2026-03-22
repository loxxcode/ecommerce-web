import React, { useState } from "react";
import { products } from "@/data/mock";
import { Trash2, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const BuyerWishlist = () => {
  const { items: wishlistIds, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

  if (wishlistProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium">Your wishlist is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">Save items you love to find them later</p>
        <Link to="/products"><Button className="mt-4 rounded-xl">Browse Products</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">My Wishlist <span className="text-muted-foreground font-normal text-lg">({wishlistProducts.length})</span></h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {wishlistProducts.map(p => (
          <div key={p.id} className="flex gap-3 rounded-xl border border-border bg-card p-3 shadow-card transition-all hover:shadow-elevated">
            <Link to={`/products/${p.id}`}>
              <img src={p.image} alt={p.name} className="h-20 w-20 rounded-xl object-cover" />
            </Link>
            <div className="flex flex-1 flex-col justify-between min-w-0">
              <div>
                <Link to={`/products/${p.id}`} className="text-sm font-medium hover:text-primary transition-colors line-clamp-2">{p.name}</Link>
                <p className="mt-0.5 font-heading text-base font-bold">${p.price}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="gap-1.5 rounded-lg text-xs" onClick={() => { addItem({ id: p.id, name: p.name, price: p.price, image: p.image, seller: p.seller }); toast.success("Added to cart"); }}>
                  <ShoppingCart size={12} /> Add to Cart
                </Button>
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => { removeFromWishlist(p.id); toast("Removed from wishlist"); }}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyerWishlist;
