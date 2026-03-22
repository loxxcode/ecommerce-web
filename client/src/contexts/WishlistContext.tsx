import React, { createContext, useContext, useState, ReactNode } from "react";

interface WishlistContextType {
  items: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<string[]>(["1", "4", "6"]);

  const addToWishlist = (id: string) => setItems((prev) => prev.includes(id) ? prev : [...prev, id]);
  const removeFromWishlist = (id: string) => setItems((prev) => prev.filter((i) => i !== id));
  const isInWishlist = (id: string) => items.includes(id);
  const toggleWishlist = (id: string) => isInWishlist(id) ? removeFromWishlist(id) : addToWishlist(id);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be inside WishlistProvider");
  return ctx;
};
