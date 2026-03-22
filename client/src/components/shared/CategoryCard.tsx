import React from "react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  icon: string;
  count: number;
  image?: string;
}

const CategoryCard = ({ name, icon, count, image }: CategoryCardProps) => (
  <Link
    to={`/products?category=${encodeURIComponent(name)}`}
    className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5"
  >
    {image ? (
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={image} alt={name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-heading text-sm font-bold text-white">{name}</h3>
          <p className="text-[11px] text-white/70">{count} products</p>
        </div>
      </div>
    ) : (
      <div className="flex flex-col items-center gap-2.5 p-5">
        <span className="text-3xl transition-transform duration-300 group-hover:scale-110">{icon}</span>
        <h3 className="font-heading text-sm font-semibold">{name}</h3>
        <p className="text-xs text-muted-foreground">{count} products</p>
      </div>
    )}
  </Link>
);

export default CategoryCard;
