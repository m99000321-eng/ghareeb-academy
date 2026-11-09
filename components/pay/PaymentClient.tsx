"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Copy,
  FlaskConical,
  Landmark,
  Loader2,
  Lock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { formatPrice } from "@/lib/products";
import { PaymentIcon } from "@/components/admin/PaymentIcon";
import { cn } from "@/lib/utils";
import type { PaymentMethodId } from "@/lib/commerce-types";

type PaymentMethodInfo = {
  id: PaymentMethodId;
  name: string;
  description: string;
  kind: "cod" | "manual" | "online";
};

type ManualInfo = {
  instapayHandle: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
};

const inputClass =
  "h-12 w-full rounded-2xl border border-white/12 bg-ink/50 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-acid/60";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
      <p className="text-[9px] font-bold text-white/35">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="truncate font-mono text-[12px] font-bold text-white/85" dir="ltr">
          {value}
        </p>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              setCopied(false);
            }
          }}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/10 text-white/35 hover:border-acid/40 hover:text-acid"
          aria-label={`نسخ ${label}`}
        >
          {copied ? <Check size={12} className="text-acid" /> : <Copy size={12} />}
        </button>
      </div>
    </div>
  );
}

export function PaymentClient({
  order,
  method,
  manual,
}: {
  order: {
    id: string;
    total: number;
    customerName: string;
    items: Array<{ name: string; qty: number; price: number }>;
  };
  method: PaymentMethodInfo;
  manual: ManualInfo;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [card, setCard] = useState({ number: "", holder: "", expiry: "", cvv: "" });
  const [phone, setPhone] = useState("");
  const [walletProvider, setWalletProvider] = useState("Vodafone Cash");
  const [email, setEmail] = useState("");
  const [installments, setInstallments] = useState(6);
  const [reference, setReference] = useState("");

  const isCard = method.id === "card" || method.id === "mada";
  const isWallet = method.id === "wallet";
  const isPhone = method.id === "applepay" || method.id === "stcpay" || isWallet;
  const isFawry = method.id === "fawry";
  const isPaypal = method.id === "paypal";
  const isValu = method.id === "valu";
  const isManual = method.kind === "manual";
  const fawryCode = `GW-${order.id.replace(/[^A-Z0-9]/g, "").slice(-8)}`;

  function validate(): string | null {
    if (isCard) {
      const digits = card.number.replace(/\s/g, "");
      if (digits.length < 15 || !/^\d+$/.test(digits)) return "رقم البطاقة غير صحيح";
      if (card.holder.trim().length < 3) return "أدخل اسم حامل البطاقة";
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return "تاريخ الانتهاء غير صحيح";
      if (!/^\d{3,4}$/.test(card.cvv)) return "رمز CVV غير صحيح";
    }
    if (isPhone && phone.replace(/\D/g, "").length < 9) {
      return "أدخل رقم محفظة صحيحًا";
    }
    if (isPaypal && !email.includes("@")) return "أدخل بريد PayPal صحيحًا";
    if (isManual && reference.trim().length < 4) {
      return "أدخل رقم عملية التحويل (4 أحرف على الأقل)";
    }
    return null;
  }

  async function simulatePayment(outcome: "success" | "fail") {
    if (busy) return;
    const problem = outcome === "success" ? validate() : null;
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, outcome }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        redirectUrl?: string;
        message?: string;
      };
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "تعذّر إتمام الدفع");
      }
      if (data.redirectUrl) {
        router.push(data.redirectUrl);
        return;
      }
      setError(data.message ?? "فشلت المحاكاة");
    } catch (paymentError) {
      setError(
        paymentError instanceof Error ? paymentError.message : "تعذّر إتمام الدفع",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitManual() {
    if (busy) return;
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, reference }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        redirectUrl?: string;
      };
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "تعذّر إرسال إثبات التحويل");
      }
      if (data.redirectUrl) router.push(data.redirectUrl);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "تعذّر إرسال إثبات التحويل",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative overflow-hidden pb-20 pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-x-0 top-0 h-96"
          style={{
            background:
              "radial-gradient(70% 100% at 50% 0%, rgba(200,255,46,0.08), transparent 70%)",
          }}
        />
        <div className="bg-grid absolute inset-0 opacity-[0.08]" />
      </div>

      <div className="container-x relative max-w-4xl">
        <Link
          href="/checkout"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/35 transition-colors hover:text-acid"
        >
          <ArrowLeft size={13} />
          العودة
        </Link>

        <div className="mt-5 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-acid/25 bg-acid/[0.07]">
            <PaymentIcon id={method.id} size={24} className="text-acid" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-black sm:text-4xl">
            الدفع عبر <span className="text-gradient-acid">{method.name}</span>
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-xs leading-6 text-white/40">
            {method.description}
          </p>
          <p className="mt-2 font-mono text-[10px] text-white/30">{order.id}</p>
        </div>

        <div className="mt-8 grid items-start gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            {method.kind === "online" ? (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-violet/20 bg-violet/[0.06] px-4 py-3 text-[10px] leading-5 text-violet-200/80">
                <FlaskConical size={13} className="mt-0.5 shrink-0" />
                بيئة تجريبية — لن يتم خصم أي مبلغ حقيقي. جرّب نجاح الدفع أو فشله
                لمشاهدة كامل التدفق.
              </div>
            ) : (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-gold/20 bg-gold/[0.05] px-4 py-3 text-[10px] leading-5 text-gold/85">
                <Landmark size={13} className="mt-0.5 shrink-0" />
                حوّل المبلغ إلى الحساب أدناه ثم أدخل رقم العملية — سيتم تأكيد طلبك
                بعد مراجعة الإدارة.
              </div>
            )}

            {isCard ? (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-[11px] font-bold text-white/45">رقم البطاقة</span>
                  <input
                    value={card.number}
                    onChange={(event) => {
                      const digits = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 16)
                        .replace(/(\d{4})(?=\d)/g, "$1 ");
                      setCard((current) => ({ ...current, number: digits }));
                    }}
                    placeholder="4242 4242 4242 4242"
                    inputMode="numeric"
                    className={`mt-2 ${inputClass}`}
                    dir="ltr"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-bold text-white/45">
                    اسم حامل البطاقة
                  </span>
                  <input
                    value={card.holder}
                    onChange={(event) =>
                      setCard((current) => ({ ...current, holder: event.target.value }))
                    }
                    placeholder="FARIS ALOTAIBI"
                    className={`mt-2 ${inputClass}`}
                  />
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-[11px] font-bold text-white/45">
                      تاريخ الانتهاء
                    </span>
                    <input
                      value={card.expiry}
                      onChange={(event) => {
                        const raw = event.target.value.replace(/\D/g, "").slice(0, 4);
                        const value =
                          raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
                        setCard((current) => ({ ...current, expiry: value }));
                      }}
                      placeholder="MM/YY"
                      inputMode="numeric"
                      className={`mt-2 ${inputClass}`}
                      dir="ltr"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-bold text-white/45">CVV</span>
                    <input
                      value={card.cvv}
                      onChange={(event) =>
                        setCard((current) => ({
                          ...current,
                          cvv: event.target.value.replace(/\D/g, "").slice(0, 4),
                        }))
                      }
                      placeholder="123"
                      inputMode="numeric"
                      type="password"
                      className={`mt-2 ${inputClass}`}
                      dir="ltr"
                    />
                  </label>
                </div>
                <p className="text-[9px] text-white/25">
                  بطاقة تجريبية: 4242 4242 4242 4242 — أي تاريخ مستقبلي وأي CVV.
                </p>
              </div>
            ) : null}

            {isPhone ? (
              <div className="space-y-4">
                {isWallet ? (
                  <label className="block">
                    <span className="text-[11px] font-bold text-white/45">
                      المحفظة
                    </span>
                    <select
                      value={walletProvider}
                      onChange={(event) => setWalletProvider(event.target.value)}
                      className={`mt-2 ${inputClass}`}
                    >
                      <option>Vodafone Cash</option>
                      <option>Etisalat Cash</option>
                      <option>Orange Cash</option>
                      <option>WE Pay</option>
                    </select>
                  </label>
                ) : null}
                <label className="block">
                  <span className="text-[11px] font-bold text-white/45">
                    {method.id === "stcpay"
                      ? "رقم STC Pay"
                      : method.id === "applepay"
                        ? "رقم الجوال المرتبط بـ Apple Pay"
                        : `رقم محفظة ${walletProvider}`}
                  </span>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="05xxxxxxxx"
                    inputMode="tel"
                    className={`mt-2 ${inputClass}`}
                    dir="ltr"
                  />
                </label>
                <p className="text-[9px] leading-5 text-white/25">
                  سيصلك إشعار على هاتفك لإتمام العملية (محاكاة في الوضع التجريبي).
                </p>
              </div>
            ) : null}

            {isFawry ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] p-5 text-center">
                  <p className="text-[10px] font-bold text-gold/80">
                    كود الدفع في فوري
                  </p>
                  <p className="mt-2 font-mono text-2xl font-black tracking-widest text-gold">
                    {fawryCode}
                  </p>
                  <p className="mt-2 text-[9px] leading-5 text-white/35">
                    ادفع الكود في أي منفذ فوري أو تطبيق MyFawry. صالح لمدة 24 ساعة.
                  </p>
                </div>
                <p className="text-[9px] text-white/25">
                  في الوضع التجريبي يمكنك الضغط على «تم الدفع» مباشرة لمحاكاة نجاح
                  العملية.
                </p>
              </div>
            ) : null}

            {isPaypal ? (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-[11px] font-bold text-white/45">
                    بريد حساب PayPal
                  </span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@email.com"
                    type="email"
                    className={`mt-2 ${inputClass}`}
                    dir="ltr"
                  />
                </label>
                <p className="text-[9px] leading-5 text-white/25">
                  ستُحوّل إلى PayPal لإكمال الدفع في الوضع الحقيقي.
                </p>
              </div>
            ) : null}

            {isValu ? (
              <div className="space-y-4">
                <p className="text-[11px] font-bold text-white/45">
                  خطة التقسيط
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 6, 12].map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setInstallments(months)}
                      className={cn(
                        "rounded-xl border px-2 py-3 text-center transition-colors",
                        installments === months
                          ? "border-acid/60 bg-acid/[0.07]"
                          : "border-white/12",
                      )}
                    >
                      <span className="block text-lg font-black">
                        {months}
                      </span>
                      <span className="text-[9px] text-white/40">شهور</span>
                      <span className="mt-1 block text-[10px] font-bold text-acid">
                        {formatPrice(Math.ceil(order.total / months))} ر.س
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-[9px] leading-5 text-white/25">
                  تقسيط بدون فوائد — يخضع لموافقة Valu.
                </p>
              </div>
            ) : null}

            {isManual ? (
              <div className="space-y-3">
                <CopyField
                  label="حساب إنستاباي"
                  value={manual.instapayHandle}
                />
                <CopyField label="البنك" value={manual.bankName} />
                <CopyField label="رقم الحساب / IBAN" value={manual.bankAccount} />
                <CopyField label="اسم صاحب الحساب" value={manual.bankHolder} />
                <div className="rounded-xl border border-gold/15 bg-gold/[0.04] px-4 py-3 text-center">
                  <p className="text-[9px] text-white/40">المبلغ المطلوب تحويله</p>
                  <p className="mt-1 font-display text-xl font-black text-gold">
                    {formatPrice(order.total)} ر.س
                  </p>
                </div>
                <label className="block">
                  <span className="text-[11px] font-bold text-white/45">
                    رقم عملية التحويل / المرجع
                  </span>
                  <input
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                    placeholder="مثال: 839201847"
                    className={`mt-2 ${inputClass}`}
                    dir="ltr"
                  />
                </label>
              </div>
            ) : null}

            {error ? (
              <p className="mt-4 rounded-xl border border-flare/30 bg-flare/10 px-4 py-3 text-[11px] text-flare">
                {error}
              </p>
            ) : null}

            {isManual ? (
              <button
                type="button"
                onClick={submitManual}
                disabled={busy}
                className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-acid px-6 py-4 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <ShieldCheck size={16} />
                )}
                أرسلت التحويل — تأكيد الإرسال
              </button>
            ) : (
              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={() => simulatePayment("success")}
                  disabled={busy}
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-acid px-6 py-4 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Lock size={15} />
                  )}
                  {busy
                    ? "جارٍ تنفيذ الدفع…"
                    : method.kind === "online"
                      ? `محاكاة نجاح الدفع — ${formatPrice(order.total)} ر.س`
                      : `ادفع ${formatPrice(order.total)} ر.س`}
                </button>
                {method.kind === "online" ? (
                  <button
                    type="button"
                    onClick={() => simulatePayment("fail")}
                    disabled={busy}
                    className="w-full rounded-full border border-white/10 px-6 py-2.5 text-[10px] font-bold text-white/35 transition-colors hover:border-flare/30 hover:text-flare disabled:opacity-50"
                  >
                    محاكاة فشل الدفع
                  </button>
                ) : null}
              </div>
            )}

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[9px] text-white/25">
              <Lock size={10} />
              اتصال مشفّر — بياناتك محمية
            </p>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-extrabold">ملخص الطلب</h2>
            <p className="mt-1 text-[10px] text-white/35">
              {order.customerName} — {order.id}
            </p>
            <div className="mt-4 space-y-2.5 border-t border-white/10 pt-4">
              {order.items.map((item) => (
                <div
                  key={`${item.name}-${item.qty}`}
                  className="flex items-start justify-between gap-3 text-[11px]"
                >
                  <span className="min-w-0 text-white/60">
                    {item.name}
                    <span className="text-white/25"> × {item.qty}</span>
                  </span>
                  <span className="shrink-0 font-bold text-white/80">
                    {formatPrice(item.price * item.qty)} ر.س
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-white/55">الإجمالي</span>
              <span className="font-display text-xl font-black text-acid">
                {formatPrice(order.total)}
                <span className="ms-1 text-[10px] font-bold text-white/40">ر.س</span>
              </span>
            </div>
            <div className="mt-4 space-y-2 rounded-xl bg-black/20 p-3 text-[9px] text-white/35">
              <p className="flex items-center gap-1.5">
                <BadgeCheck size={12} className="text-acid" />
                طلبك محفوظ ويمكنك إكمال الدفع لاحقًا
              </p>
              <p className="flex items-center gap-1.5">
                <Zap size={12} className="text-gold" />
                تأكيد فوري بعد نجاح الدفع
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
