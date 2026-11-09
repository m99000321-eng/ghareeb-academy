"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  categoryMap,
  formatPrice,
  productMap,
} from "@/lib/products";
import { useCart } from "@/lib/store";
import { categoryIcons } from "@/components/site/categoryIcons";

export default function CartPage() {
  const items = useCart((state) => state.items);
  const setQty = useCart((state) => state.setQty);
  const remove = useCart((state) => state.remove);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const lines = items
    .map((line) => ({ line, product: productMap[line.slug] }))
    .filter((entry) => Boolean(entry.product));

  const subtotal = lines.reduce(
    (sum, entry) => sum + entry.product.price * entry.line.qty,
    0,
  );
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="relative min-h-[70vh] overflow-hidden pb-20 pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-x-0 top-0 h-96"
          style={{
            background:
              "radial-gradient(80% 100% at 50% 0%, rgba(200,255,46,0.08), transparent 70%)",
          }}
        />
        <div className="bg-grid absolute inset-0 opacity-[0.08]" />
      </div>

      <div className="container-x relative">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.28em] text-acid">
          <span className="h-px w-8 bg-acid/60" />
          YOUR CART
        </span>
        <h1 className="mt-4 font-display text-4xl font-black sm:text-5xl">
          سلة <span className="text-gradient-acid">الغريب</span>
        </h1>

        {!mounted ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/[0.02]" />
            <div className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/[0.02]" />
          </div>
        ) : lines.length === 0 ? (
          <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-white/15 py-24 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/40">
              <ShoppingBag size={24} />
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold">سلتك فارغة… حتى الآن</h2>
            <p className="mt-2 max-w-sm text-sm text-white/40">
              البوابة مفتوحة. اختر عتادك من المتجر وابدأ رحلتك إلى بُعد آخر.
            </p>
            <Link
              href="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-acid px-6 py-3.5 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5"
            >
              تسوّق الآن
              <ArrowLeft size={16} />
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-3">
              {lines.map(({ line, product }) => {
                const category = categoryMap[product.category];
                const Icon = categoryIcons[product.category];
                return (
                  <div
                    key={line.slug}
                    className="relative flex gap-4 rounded-3xl border border-white/10 bg-white/[0.025] p-3.5 sm:p-4"
                  >
                    <Link
                      href={`/shop/${product.slug}`}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 sm:h-28 sm:w-28"
                      style={{ background: category.colorSoft }}
                    >
                      <span className="bg-grid absolute inset-0 opacity-30" />
                      <Icon
                        size={34}
                        strokeWidth={1.2}
                        className="absolute inset-0 m-auto"
                        style={{ color: category.color }}
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        href={`/shop/${product.slug}`}
                        className="line-clamp-1 ps-8 text-sm font-bold transition-colors hover:text-acid sm:text-[15px]"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-[10px] tracking-[0.16em] text-white/30">
                        {product.nameEn.toUpperCase()}
                      </p>
                      <p className="mt-1 text-[11px]" style={{ color: category.color }}>
                        {category.name}
                      </p>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                        <div className="flex h-9 items-center gap-1 rounded-full border border-white/12 bg-ink/40 px-1">
                          <button
                            type="button"
                            onClick={() => setQty(line.slug, line.qty + 1)}
                            aria-label="زيادة الكمية"
                            className="grid h-7 w-7 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <Plus size={13} />
                          </button>
                          <span className="w-7 text-center text-xs font-extrabold">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(line.slug, line.qty - 1)}
                            aria-label="تقليل الكمية"
                            className="grid h-7 w-7 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <Minus size={13} />
                          </button>
                        </div>

                        <p className="text-sm font-extrabold">
                          {formatPrice(product.price * line.qty)}
                          <span className="ms-1 text-[10px] font-semibold text-white/40">
                            ر.س
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(line.slug)}
                      aria-label={`إزالة ${product.name}`}
                      className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full text-white/30 transition-colors hover:bg-flare/10 hover:text-flare"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-2 pt-2 text-xs font-bold text-white/45 transition-colors hover:text-acid"
              >
                <ArrowLeft size={14} />
                متابعة التسوّق
              </Link>
            </div>

            <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-xl font-extrabold">ملخّص الطلب</h2>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between text-white/55">
                  <span>المجموع الفرعي</span>
                  <span className="font-bold text-white">
                    {formatPrice(subtotal)} ر.س
                  </span>
                </div>
                <div className="flex items-center justify-between text-white/55">
                  <span>الشحن</span>
                  <span className="font-bold text-white">
                    {shipping === 0 ? "مجاني" : `${formatPrice(shipping)} ر.س`}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-acid to-cyan transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-white/40">
                  {remaining === 0 ? (
                    <span className="text-acid">حصلت على شحن مجاني</span>
                  ) : (
                    <>
                      أضف <span className="font-bold text-white">{formatPrice(remaining)}</span>{" "}
                      ر.س للحصول على شحن مجاني
                    </>
                  )}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-sm text-white/60">الإجمالي</span>
                <span className="font-display text-2xl font-black text-acid">
                  {formatPrice(total)}
                  <span className="ms-1 text-xs font-bold text-white/40">ر.س</span>
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-6 flex items-center justify-center gap-2 rounded-full bg-acid px-6 py-4 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5"
              >
                إتمام الطلب
                <ArrowLeft size={16} />
              </Link>

              <div className="mt-5 flex items-center justify-center gap-4 border-t border-white/10 pt-4 text-[10px] text-white/35">
                <span className="flex items-center gap-1.5">
                  <Truck size={12} className="text-acid" />
                  شحن 48 ساعة
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-acid" />
                  دفع آمن
                </span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
