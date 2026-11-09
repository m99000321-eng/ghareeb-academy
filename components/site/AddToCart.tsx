"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/store";
import { formatPrice, type Product } from "@/lib/products";

export function AddToCart({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((state) => state.add);
  const maxQty = Math.min(product.stock, 10);

  function handleAdd() {
    add(product.slug, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2600);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex h-14 items-center justify-between rounded-full border border-white/15 bg-white/[0.03] px-2 sm:w-40">
          <button
            type="button"
            onClick={() => setQty((value) => Math.min(maxQty, value + 1))}
            aria-label="زيادة الكمية"
            className="grid h-10 w-10 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Plus size={16} />
          </button>
          <span className="w-8 text-center text-sm font-extrabold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((value) => Math.max(1, value - 1))}
            aria-label="تقليل الكمية"
            className="grid h-10 w-10 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Minus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-acid px-6 text-sm font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-[#d8ff5e]"
        >
          {added ? <Check size={18} /> : <ShoppingBag size={18} />}
          {added ? "تمت الإضافة إلى السلة" : `أضف إلى السلة — ${formatPrice(product.price * qty)} ر.س`}
        </button>
      </div>

      {added ? (
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-xs font-bold text-acid transition-colors hover:text-white"
        >
          انتقل إلى السلة لإتمام الطلب
          <ArrowLeft size={14} />
        </Link>
      ) : (
        <p className="text-xs text-white/35">
          شحن مجاني للطلبات فوق 700 ر.س — إرجاع خلال 30 يومًا.
        </p>
      )}
    </div>
  );
}
