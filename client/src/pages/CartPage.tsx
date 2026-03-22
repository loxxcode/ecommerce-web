import React from "react";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { formatFRW } from "@/lib/currency";

const CartPage = () => {
  const { items, removeItem, updateQuantity, total, count, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary">
          <ShoppingBag size={36} className="text-muted-foreground/40" />
        </div>
        <h1 className="mt-5 font-heading text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">Looks like you haven't added any items yet. Start browsing to find products you'll love.</p>
        <Link to="/products"><Button className="mt-5 gap-2 rounded-xl bg-primary hover:bg-primary/90 transition-all active:scale-[0.97]">Browse Products <ArrowRight size={14} /></Button></Link>
      </div>
    );
  }

  const shipping = total >= 50000 ? 0 : 2500;
  const tax = total * 0.18;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Shopping Cart <span className="text-muted-foreground font-normal text-lg">({count} items)</span></h1>
        <button onClick={() => { clearCart(); toast("Cart cleared"); }} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Clear Cart</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map(item => (
            <div key={item.id} className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition-all hover:shadow-elevated">
              <Link to={`/products/${item.id}`}>
                <img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28 transition-transform hover:scale-105" />
              </Link>
              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div>
                  <Link to={`/products/${item.id}`} className="font-medium text-sm sm:text-base hover:text-primary transition-colors line-clamp-2">{item.name}</Link>
                  <p className="text-xs text-muted-foreground mt-0.5">Sold by {item.seller}</p>
                </div>
                <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                  <div className="flex items-center rounded-lg border border-input overflow-hidden">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2.5 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors active:scale-95"><Minus size={12} /></button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums border-x border-input py-1.5">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2.5 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors active:scale-95"><Plus size={12} /></button>
                  </div>
                  <span className="font-heading text-base font-bold">{formatFRW(item.price * item.quantity)}</span>
                  <button onClick={() => { removeItem(item.id); toast("Item removed from cart"); }} className="text-muted-foreground hover:text-destructive transition-colors active:scale-95">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 h-fit space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-heading text-lg font-bold">Order Summary</h2>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({count} items)</span><span className="font-medium">{formatFRW(total)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={shipping === 0 ? "text-success font-medium" : ""}>{shipping === 0 ? "FREE" : formatFRW(shipping)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Est. Tax (18%)</span><span>{formatFRW(tax)}</span></div>
              {shipping > 0 && <p className="text-[11px] text-primary">Add {formatFRW(50000 - total)} more for free shipping</p>}
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between font-heading text-lg font-bold"><span>Total</span><span>{formatFRW(total + shipping + tax)}</span></div>
            </div>
            <Link to="/checkout">
              <Button className="mt-5 w-full gap-2 rounded-xl bg-primary hover:bg-primary/90 transition-all active:scale-[0.97]">
                Proceed to Checkout <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
            <Shield size={14} /> Secure checkout · <Truck size={14} /> Free returns
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
