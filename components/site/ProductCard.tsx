"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Check, Plus, Star } from "lucide-react";
import { categoryMap, formatPrice, type Product } from "@/lib/products";
import { categoryIcons } from "./categoryIcons";
import { useCart } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const category = categoryMap[product.category];
  const Icon = categoryIcons[product.category];
  const add = useCart((state) => state.add);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleAdd() {
    add(product.slug);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  }

  return (
    <article className={cn("group flex flex-col", className)}>
      <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-ink-2 transition-all duration-500 group-hover:border-white/25 group-hover:shadow-[0_26px_80px_-34px_rgba(200,255,46,0.35)]">
        <Link href={`/shop/${product.slug}`} aria-label={product.name} className="block">
          <div className="relative aspect-[4/5] overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(120% 100% at 20% 0%, ${category.colorSoft}, transparent 58%)`,
              }}
            />
            <div className="bg-grid absolute inset-0 opacity-25" />

            <div className="absolute left-1/2 top-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2">
              <div
                className="absolute inset-0 rounded-full opacity-50 blur-3xl transition-opacity duration-700 group-hover:opacity-80"
                style={{ background: category.color }}
              />
              <div
                className="absolute inset-[6%] rounded-full transition-transform duration-700 group-hover:scale-105"
                style={{
                  background: `radial-gradient(circle at 32% 26%, #ffffff 0%, ${category.color} 34%, #080812 82%)`,
                  boxShadow: `inset -20px -26px 60px rgba(0,0,0,0.7), 0 0 70px ${category.colorSoft}`,
                }}
              />
              <span className="absolute inset-0 rounded-full border border-white/15" />
              <span className="absolute -inset-3 rounded-full border border-dashed border-white/12 animate-spin-slow" />
            </div>

            <Icon
              size={72}
              strokeWidth={1}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
            />

            {product.badge ? (
              <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-ink/60 px-3 py-1 text-[10px] font-bold text-white/85 backdrop-blur-md">
                {product.badge}
              </span>
            ) : null}

            <span className="absolute bottom-4 right-4 text-[10px] font-semibold tracking-[0.18em] text-white/40">
              {category.nameEn.toUpperCase()}
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleAdd}
          aria-label={`أضف ${product.name} إلى السلة`}
          className={cn(
            "absolute bottom-3 left-3 z-20 grid h-11 w-11 place-items-center rounded-full transition-all duration-300",
            added
              ? "bg-white text-ink"
              : "bg-acid text-ink hover:scale-110 hover:bg-[#d8ff5e]",
          )}
        >
          {added ? <Check size={18} /> : <Plus size={18} />}
        </button>
      </div>

      <div className="mt-4 flex flex-1 flex-col px-1">
        <Link
          href={`/shop/${product.slug}`}
          className="line-clamp-2 text-[15px] font-bold leading-6 text-white/90 transition-colors hover:text-acid"
        >
          {product.name}
        </Link>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-white/30">
          {product.nameEn.toUpperCase()}
        </p>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-white">
              {formatPrice(product.price)}
              <span className="ms-1 text-[11px] font-semibold text-white/40">ر.س</span>
            </span>
            {product.oldPrice ? (
              <span className="text-xs text-white/30 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            ) : null}
          </div>
          <span className="flex items-center gap-1 text-[11px] text-white/50">
            <Star size={12} className="fill-acid text-acid" />
            {product.rating}
            <span className="text-white/25">({product.reviews})</span>
          </span>
        </div>
      </div>
    </article>
  );
}
