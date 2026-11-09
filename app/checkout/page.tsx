"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  FlaskConical,
  Loader2,
  Lock,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { formatPrice } from "@/lib/products";
import { useCatalog, useStoreSettings } from "@/lib/useCatalog";
import { useCart } from "@/lib/store";
import { PaymentIcon } from "@/components/admin/PaymentIcon";
import { cn } from "@/lib/utils";
import type { PaymentMethodId } from "@/lib/commerce-types";

type MethodOption = {
  id: PaymentMethodId;
  name: string;
  description: string;
  kind: "cod" | "manual" | "online";
  badge?: string;
  fee: number;
};

const inputClass =
  "h-12 w-full rounded-2xl border border-white/12 bg-ink/50 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-acid/60";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);
  const catalog = useCatalog();
  const storedSettings = useStoreSettings();
  const [mounted, setMounted] = useState(false);
  const [methods, setMethods] = useState<MethodOption[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentMethodId>("cod");
  const [settings, setSettings] = useState(storedSettings);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSettings(storedSettings);
  }, [storedSettings]);

  useEffect(() => {
    let active = true;
    fetch("/api/payments/methods")
      .then((response) => response.json())
      .then(
        (data: {
          methods?: MethodOption[];
          settings?: typeof storedSettings;
        }) => {
          if (!active) return;
          if (Array.isArray(data.methods) && data.methods.length > 0) {
            setMethods(data.methods);
            setPayment((current) =>
              data.methods!.some((method) => method.id === current)
                ? current
                : data.methods![0].id,
            );
          }
          if (data.settings) setSettings(data.settings);
        },
      )
      .catch(() => undefined)
      .finally(() => {
        if (active) setMethodsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const selected = useMemo(
    () => methods.find((method) => method.id === payment),
    [methods, payment],
  );

  const lines = items
    .map((line) => ({ line, product: catalog[line.slug] }))
    .filter((entry) => Boolean(entry.product));
  const subtotal = lines.reduce(
    (sum, entry) => sum + entry.product.price * entry.line.qty,
    0,
  );
  const shipping =
    subtotal === 0 || subtotal >= settings.freeShippingThreshold
      ? 0
      : settings.shippingFee;
  const codFee = payment === "cod" ? settings.codFee : 0;
  const total = subtotal + shipping + codFee;

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
        email: String(form.get("email") ?? ""),
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
        redirectUrl?: string;
      };
      if (!response.ok || !data.ok || !data.redirectUrl) {
        throw new Error(data.error ?? "تعذّر إتمام الطلب، حاول مرة أخرى");
      }
      clear();
      router.push(data.redirectUrl);
    } catch (submitError) {
      setStatus("error");
      setError(
        submitError instanceof Error
          ? submitError.message
          : "تعذّر إتمام الطلب، حاول مرة أخرى",
      );
    }
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
          اختر طريقة الدفع المناسبة لك — كل الطرق متاحة وآمنة.
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
                  البريد الإلكتروني (اختياري)
                </span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@email.com"
                  className={`mt-2 ${inputClass}`}
                  dir="ltr"
                />
              </label>
              <label className="block sm:col-span-2">
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

            <div className="mt-8 flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold">طريقة الدفع</h2>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-acid">
                <ShieldCheck size={13} />
                {methods.length || "…"} طريقة متاحة
              </span>
            </div>

            {methodsLoading ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[0, 1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-[76px] animate-pulse rounded-2xl border border-white/8 bg-white/[0.02]"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {methods.map((method) => {
                  const active = payment === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPayment(method.id)}
                      className={cn(
                        "flex items-start gap-3 rounded-2xl border p-4 text-right transition-colors",
                        active
                          ? "border-acid/60 bg-acid/[0.06]"
                          : "border-white/12 hover:border-white/30",
                      )}
                    >
                      <PaymentIcon
                        id={method.id}
                        size={18}
                        className={cn(
                          "mt-0.5 shrink-0",
                          active ? "text-acid" : "text-white/35",
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-bold">{method.name}</span>
                          {method.badge ? (
                            <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[8px] font-bold text-gold">
                              {method.badge}
                            </span>
                          ) : null}
                          {method.fee > 0 ? (
                            <span className="text-[9px] text-white/35">
                              +{method.fee} ر.س
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-[10px] leading-4 text-white/40">
                          {method.description}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                          active ? "border-acid bg-acid" : "border-white/30",
                        )}
                      >
                        {active ? <Check size={10} className="text-ink" /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {selected?.kind === "online" ? (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-violet/20 bg-violet/[0.05] px-4 py-3 text-[10px] leading-5 text-violet-200/80">
                <FlaskConical size={13} className="mt-0.5 shrink-0" />
                الدفع الإلكتروني يعمل حاليًا في وضع المحاكاة الآمنة (بدون خصم
                فعلي). بعد إضافة مفاتيح بوابة الدفع سيتم التحصيل الحقيقي تلقائيًا.
              </p>
            ) : null}

            {selected?.kind === "manual" ? (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-gold/20 bg-gold/[0.05] px-4 py-3 text-[10px] leading-5 text-gold/80">
                <Lock size={13} className="mt-0.5 shrink-0" />
                بعد تأكيد الطلب ستظهر بيانات الحساب، أرسل رقم عملية التحويل
                وسيتم تأكيد طلبك بعد المراجعة.
              </p>
            ) : null}

            <p className="mt-6 flex items-center gap-2 text-[11px] text-white/30">
              <Lock size={12} />
              بياناتك مشفّرة ولا تُستخدم لأي غرض آخر.
            </p>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-extrabold">ملخّص الطلب</h2>

            <div className="mt-5 max-h-64 space-y-3 overflow-y-auto pe-1">
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
              {codFee > 0 ? (
                <div className="flex items-center justify-between text-white/50">
                  <span>رسوم الاستلام</span>
                  <span className="font-bold text-white">{formatPrice(codFee)} ر.س</span>
                </div>
              ) : null}
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
              disabled={status === "loading" || methodsLoading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-acid px-6 py-4 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  جارٍ تأكيد الطلب…
                </>
              ) : (
                <>
                  {selected?.kind === "cod"
                    ? `تأكيد الطلب — ${formatPrice(total)} ر.س`
                    : `الانتقال للدفع — ${formatPrice(total)} ر.س`}
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
