"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Loader2,
  Lock,
  ShoppingBag,
  Truck,
} from "lucide-react";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  formatPrice,
  productMap,
} from "@/lib/products";
import { useCart } from "@/lib/store";
import { cn } from "@/lib/utils";

type OrderResponse = {
  id: string;
  subtotal: number;
  shipping: number;
  total: number;
  payment: "cod" | "card";
  customer: { name: string; city: string };
};

const inputClass =
  "h-12 w-full rounded-2xl border border-white/12 bg-ink/50 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-acid/60";

export default function CheckoutPage() {
  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);
  const [mounted, setMounted] = useState(false);
  const [payment, setPayment] = useState<"cod" | "card">("cod");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderResponse | null>(null);

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading" || items.length === 0) return;
    setStatus("loading");
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      customer: {
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        city: String(form.get("city") ?? ""),
        address: String(form.get("address") ?? ""),
        notes: String(form.get("notes") ?? ""),
      },
      payment,
      items: items.map((item) => ({ slug: item.slug, qty: item.qty })),
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        order?: OrderResponse;
      };
      if (!response.ok || !data.ok || !data.order) {
        throw new Error(data.error ?? "تعذّر إتمام الطلب، حاول مرة أخرى");
      }
      setOrder(data.order);
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      setStatus("error");
      setError(
        submitError instanceof Error
          ? submitError.message
          : "تعذّر إتمام الطلب، حاول مرة أخرى",
      );
    }
  }

  if (order) {
    return (
      <div className="relative overflow-hidden pb-20 pt-36">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-acid/10 blur-[120px]" />
        </div>
        <div className="container-x relative max-w-2xl text-center">
          <span className="relative mx-auto grid h-20 w-20 place-items-center rounded-full border border-acid/30 bg-acid/10">
            <span className="absolute inset-0 animate-ping rounded-full border border-acid/20" />
            <Check size={32} className="text-acid" />
          </span>
          <h1 className="mt-7 font-display text-3xl font-black sm:text-4xl">
            وصل طلبك إلى <span className="text-gradient-acid">البُعد الآخر</span>
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/50">
            شكرًا {order.customer.name}. استلمنا طلبك وسيتواصل فريق الغريب معك
            لتأكيد التفاصيل قبل الشحن.
          </p>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-right">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] tracking-[0.2em] text-white/35">
                ORDER ID
              </span>
              <span className="font-mono text-sm font-bold text-acid">{order.id}</span>
            </div>
            <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-3">
              <div>
                <p className="text-[10px] text-white/35">المدينة</p>
                <p className="mt-1 text-sm font-bold">{order.customer.city}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/35">طريقة الدفع</p>
                <p className="mt-1 text-sm font-bold">
                  {order.payment === "cod" ? "عند الاستلام" : "بطاقة"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-white/35">الإجمالي</p>
                <p className="mt-1 text-sm font-bold text-acid">
                  {formatPrice(order.total)} ر.س
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-acid px-7 py-3.5 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5"
            >
              تسوّق المزيد
              <ArrowLeft size={16} />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-bold text-white/75 transition-colors hover:border-white/35 hover:text-white"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="container-x pb-20 pt-32">
        <div className="h-[28rem] animate-pulse rounded-3xl border border-white/10 bg-white/[0.02]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="relative overflow-hidden pb-20 pt-36">
        <div className="container-x relative max-w-xl text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/40">
            <ShoppingBag size={24} />
          </span>
          <h1 className="mt-6 font-display text-3xl font-black">لا يوجد شيء لإتمامه</h1>
          <p className="mt-3 text-sm text-white/45">
            سلتك فارغة. اختر عتادك أولًا ثم عد إلى هنا.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-acid px-6 py-3.5 text-sm font-extrabold text-ink"
          >
            إلى المتجر
            <ArrowLeft size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden pb-20 pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-x-0 top-0 h-96"
          style={{
            background:
              "radial-gradient(80% 100% at 50% 0%, rgba(139,92,246,0.12), transparent 70%)",
          }}
        />
        <div className="bg-grid absolute inset-0 opacity-[0.08]" />
      </div>

      <div className="container-x relative">
        <nav className="flex items-center gap-2 text-[11px] text-white/35">
          <Link href="/cart" className="transition-colors hover:text-acid">
            السلة
          </Link>
          <span>/</span>
          <span className="text-white/60">إتمام الطلب</span>
        </nav>

        <h1 className="mt-5 font-display text-4xl font-black sm:text-5xl">
          إتمام <span className="text-gradient-acid">الطلب</span>
        </h1>
        <p className="mt-3 text-sm text-white/45">
          خطوة واحدة تفصلك عن عتادك. أدخل بياناتك وسنتولى الباقي.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-9 grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]"
        >
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
            <h2 className="font-display text-xl font-extrabold">بيانات التوصيل</h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-bold text-white/45">الاسم الكامل *</span>
                <input
                  name="name"
                  required
                  minLength={2}
                  autoComplete="name"
                  placeholder="مثال: فارس العتيبي"
                  className={`mt-2 ${inputClass}`}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold text-white/45">رقم الجوال *</span>
                <input
                  name="phone"
                  required
                  minLength={8}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="05xxxxxxxx"
                  className={`mt-2 ${inputClass}`}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold text-white/45">المدينة *</span>
                <input
                  name="city"
                  required
                  autoComplete="address-level2"
                  placeholder="الرياض"
                  className={`mt-2 ${inputClass}`}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold text-white/45">
                  العنوان التفصيلي *
                </span>
                <input
                  name="address"
                  required
                  minLength={8}
                  autoComplete="street-address"
                  placeholder="الحي، الشارع، رقم المبنى"
                  className={`mt-2 ${inputClass}`}
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-[11px] font-bold text-white/45">
                ملاحظات (اختياري)
              </span>
              <textarea
                name="notes"
                rows={3}
                placeholder="أي تفاصيل تساعد المندوب في الوصول إليك"
                className="mt-2 w-full rounded-2xl border border-white/12 bg-ink/50 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-acid/60"
              />
            </label>

            <h2 className="mt-8 font-display text-xl font-extrabold">طريقة الدفع</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPayment("cod")}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-right transition-colors",
                  payment === "cod"
                    ? "border-acid/60 bg-acid/[0.06]"
                    : "border-white/12 hover:border-white/30",
                )}
              >
                <Truck size={18} className="mt-0.5 shrink-0 text-acid" />
                <span>
                  <span className="block text-sm font-bold">الدفع عند الاستلام</span>
                  <span className="mt-1 block text-[11px] text-white/40">
                    ادفع نقدًا أو بالشبكة عند وصول طلبك
                  </span>
                </span>
                <span
                  className={cn(
                    "ms-auto mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                    payment === "cod" ? "border-acid bg-acid" : "border-white/30",
                  )}
                >
                  {payment === "cod" ? <Check size={10} className="text-ink" /> : null}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPayment("card")}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-right transition-colors",
                  payment === "card"
                    ? "border-acid/60 bg-acid/[0.06]"
                    : "border-white/12 hover:border-white/30",
                )}
              >
                <CreditCard size={18} className="mt-0.5 shrink-0 text-acid" />
                <span>
                  <span className="block text-sm font-bold">بطاقة بنكية</span>
                  <span className="mt-1 block text-[11px] text-white/40">
                    يُرسل رابط دفع آمن بعد تأكيد الطلب
                  </span>
                </span>
                <span
                  className={cn(
                    "ms-auto mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                    payment === "card" ? "border-acid bg-acid" : "border-white/30",
                  )}
                >
                  {payment === "card" ? <Check size={10} className="text-ink" /> : null}
                </span>
              </button>
            </div>

            <p className="mt-6 flex items-center gap-2 text-[11px] text-white/30">
              <Lock size={12} />
              بياناتك مشفّرة ولا تُستخدم لأي غرض آخر.
            </p>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-extrabold">ملخّص الطلب</h2>

            <div className="mt-5 space-y-3">
              {lines.map(({ line, product }) => (
                <div key={line.slug} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-xs font-bold text-white/80">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/30">
                      الكمية: {line.qty}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-bold">
                    {formatPrice(product.price * line.qty)} ر.س
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4 text-sm">
              <div className="flex items-center justify-between text-white/50">
                <span>المجموع الفرعي</span>
                <span className="font-bold text-white">{formatPrice(subtotal)} ر.س</span>
              </div>
              <div className="flex items-center justify-between text-white/50">
                <span>الشحن</span>
                <span className="font-bold text-white">
                  {shipping === 0 ? "مجاني" : `${formatPrice(shipping)} ر.س`}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-white/60">الإجمالي</span>
              <span className="font-display text-2xl font-black text-acid">
                {formatPrice(total)}
                <span className="ms-1 text-xs font-bold text-white/40">ر.س</span>
              </span>
            </div>

            {status === "error" && error ? (
              <p className="mt-4 rounded-xl border border-flare/30 bg-flare/10 px-4 py-3 text-[11px] text-flare">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-acid px-6 py-4 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  جارٍ تأكيد الطلب…
                </>
              ) : (
                <>
                  تأكيد الطلب — {formatPrice(total)} ر.س
                  <ArrowLeft size={16} />
                </>
              )}
            </button>
            <p className="mt-3 text-center text-[10px] text-white/30">
              بالضغط على تأكيد الطلب فأنت توافق على شروط الاستخدام وسياسة الإرجاع.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}
