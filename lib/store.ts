"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  slug: string;
  qty: number;
};

type CartState = {
  items: CartLine[];
  add: (slug: string, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (slug, qty = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.slug === slug);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.slug === slug ? { ...item, qty: Math.min(item.qty + qty, 20) } : item,
              ),
            };
          }
          return { items: [...state.items, { slug, qty: Math.min(qty, 20) }] };
        }),
      remove: (slug) =>
        set((state) => ({ items: state.items.filter((item) => item.slug !== slug) })),
      setQty: (slug, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((item) => item.slug !== slug)
              : state.items.map((item) =>
                  item.slug === slug ? { ...item, qty: Math.min(qty, 20) } : item,
                ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "ghareeb-cart-v1" },
  ),
);

export const selectCartCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.qty, 0);
