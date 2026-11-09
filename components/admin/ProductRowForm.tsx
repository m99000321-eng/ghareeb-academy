"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

export function ProductRowForm({ product }: { product: Product }) {
  const router = useRouter();
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [active, setActive] = useState(product.active !== false);
  const [featured, setFeatured] = useState(Boolean(product.featured));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save() {
    if (busy) return;
    const priceValue = Number(price);
    const stockValue = Number(stock);
    if (!Number.isFinite(priceValue) || priceValue < 1 || !Number.isFinite(stockValue) || stockValue < 0) {
      setError("أدخل سعرًا ومخزونًا صحيحين");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/products/${product.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: priceValue, stock: stockValue, active, featured }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error ?? "تعذّر الحفظ");
      setMessage("تم الحفظ");
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "تعذّر حفظ التعديلات",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-colors",
        active
          ? "border-white/10 bg-white/[0.025]"
          : "border-white/5 bg-white/[0.01] opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-bold text-white/85">
            {product.name}
          </p>
          <p className="mt-1 font-mono text-[9px] text-white/30">
            {product.sku} — {product.category}
          </p>
        </div>
        {product.stock <= 5 ? (
          <span className="shrink-0 rounded-full border border-flare/25 bg-flare/10 px-2 py-0.5 text-[8px] font-bold text-flare">
            {product.stock === 0 ? "نفد" : "منخفض"}
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[9px] font-bold text-white/35">السعر (ر.س)</span>
          <input
            type="number"
            min={1}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="mt-1 h-9 w-full rounded-lg border border-white/12 bg-black/30 px-2.5 text-[11px] text-white outline-none focus:border-acid/50"
          />
        </label>
        <label className="block">
          <span className="text-[9px] font-bold text-white/35">المخزون</span>
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            className="mt-1 h-9 w-full rounded-lg border border-white/12 bg-black/30 px-2.5 text-[11px] text-white outline-none focus:border-acid/50"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActive((value) => !value)}
          className={cn(
            "rounded-full border px-2.5 py-1 text-[9px] font-bold transition-colors",
            active
              ? "border-acid/30 bg-acid/10 text-acid"
              : "border-white/12 text-white/35",
          )}
        >
          {active ? "معروض" : "مخفي"}
        </button>
        <button
          type="button"
          onClick={() => setFeatured((value) => !value)}
          className={cn(
            "rounded-full border px-2.5 py-1 text-[9px] font-bold transition-colors",
            featured
              ? "border-gold/40 bg-gold/10 text-gold"
              : "border-white/12 text-white/35",
          )}
        >
          {featured ? "مميز" : "غير مميز"}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="ms-auto inline-flex items-center gap-1.5 rounded-lg bg-acid px-3 py-1.5 text-[10px] font-extrabold text-ink disabled:opacity-60"
        >
          {busy ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <Save size={11} />
          )}
          حفظ
        </button>
      </div>

      {message ? (
        <p className="mt-2 text-[9px] font-bold text-acid">{message}</p>
      ) : null}
      {error ? <p className="mt-2 text-[9px] text-flare">{error}</p> : null}
    </div>
  );
}
