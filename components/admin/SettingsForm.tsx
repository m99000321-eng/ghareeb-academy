"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import type { PaymentMethodId, StoreSettings } from "@/lib/commerce-types";
import { PAYMENT_METHODS } from "@/lib/payments";
import { cn } from "@/lib/utils";

const fieldClass =
  "mt-1.5 h-10 w-full rounded-xl border border-white/12 bg-black/30 px-3 text-[11px] text-white outline-none focus:border-acid/50";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [form, setForm] = useState({
    shippingFee: String(settings.shippingFee),
    freeShippingThreshold: String(settings.freeShippingThreshold),
    codFee: String(settings.codFee),
    whatsapp: settings.whatsapp,
    supportEmail: settings.supportEmail,
    instapayHandle: settings.instapayHandle,
    bankName: settings.bankName,
    bankAccount: settings.bankAccount,
    bankHolder: settings.bankHolder,
  });
  const [methods, setMethods] = useState<Record<PaymentMethodId, boolean>>({
    ...settings.methods,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function set(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingFee: Number(form.shippingFee),
          freeShippingThreshold: Number(form.freeShippingThreshold),
          codFee: Number(form.codFee),
          whatsapp: form.whatsapp,
          supportEmail: form.supportEmail,
          instapayHandle: form.instapayHandle,
          bankName: form.bankName,
          bankAccount: form.bankAccount,
          bankHolder: form.bankHolder,
          methods,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error ?? "تعذّر الحفظ");
      setMessage("تم حفظ الإعدادات وتطبيقها على المتجر");
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "تعذّر حفظ الإعدادات",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <h2 className="font-display text-base font-extrabold">الشحن والرسوم</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-[10px] font-bold text-white/40">
              رسوم الشحن (ر.س)
            </span>
            <input
              type="number"
              min={0}
              value={form.shippingFee}
              onChange={(event) => set("shippingFee", event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-white/40">
              شحن مجاني بعد (ر.س)
            </span>
            <input
              type="number"
              min={0}
              value={form.freeShippingThreshold}
              onChange={(event) => set("freeShippingThreshold", event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-white/40">
              رسوم الدفع عند الاستلام (ر.س)
            </span>
            <input
              type="number"
              min={0}
              value={form.codFee}
              onChange={(event) => set("codFee", event.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <h2 className="font-display text-base font-extrabold">طرق الدفع</h2>
        <p className="mt-1 text-[10px] text-white/35">
          فعّل أو عطّل أي طريقة — تظهر للعميل في صفحة إتمام الطلب فورًا.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {PAYMENT_METHODS.map((method) => {
            const enabled = methods[method.id] !== false;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() =>
                  setMethods((current) => ({
                    ...current,
                    [method.id]: !enabled,
                  }))
                }
                className={cn(
                  "flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-right transition-colors",
                  enabled
                    ? "border-acid/25 bg-acid/[0.05]"
                    : "border-white/8 bg-white/[0.01]",
                )}
              >
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block truncate text-[10px] font-bold",
                      enabled ? "text-white/80" : "text-white/35",
                    )}
                  >
                    {method.name}
                  </span>
                  <span className="mt-0.5 block text-[8px] text-white/25">
                    {method.kind === "cod"
                      ? "عند الاستلام"
                      : method.kind === "manual"
                        ? "تحويل يدوي"
                        : "بوابة إلكترونية"}
                  </span>
                </span>
                <span
                  className={cn(
                    "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                    enabled ? "bg-acid" : "bg-white/15",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-ink transition-all",
                      enabled ? "right-[18px]" : "right-0.5",
                    )}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <h2 className="font-display text-base font-extrabold">
          بيانات التحويل اليدوي
        </h2>
        <p className="mt-1 text-[10px] text-white/35">
          تظهر للعميل عند اختيار إنستاباي أو التحويل البنكي.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[10px] font-bold text-white/40">
              حساب إنستاباي
            </span>
            <input
              value={form.instapayHandle}
              onChange={(event) => set("instapayHandle", event.target.value)}
              className={fieldClass}
              dir="ltr"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-white/40">اسم البنك</span>
            <input
              value={form.bankName}
              onChange={(event) => set("bankName", event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-white/40">
              رقم الحساب / IBAN
            </span>
            <input
              value={form.bankAccount}
              onChange={(event) => set("bankAccount", event.target.value)}
              className={fieldClass}
              dir="ltr"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-white/40">
              اسم صاحب الحساب
            </span>
            <input
              value={form.bankHolder}
              onChange={(event) => set("bankHolder", event.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <h2 className="font-display text-base font-extrabold">التواصل والدعم</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[10px] font-bold text-white/40">واتساب</span>
            <input
              value={form.whatsapp}
              onChange={(event) => set("whatsapp", event.target.value)}
              className={fieldClass}
              dir="ltr"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-white/40">
              بريد الدعم
            </span>
            <input
              value={form.supportEmail}
              onChange={(event) => set("supportEmail", event.target.value)}
              className={fieldClass}
              dir="ltr"
            />
          </label>
        </div>
      </section>

      {message ? (
        <p className="rounded-xl border border-acid/25 bg-acid/[0.06] px-4 py-3 text-[11px] text-acid">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-flare/25 bg-flare/[0.07] px-4 py-3 text-[11px] text-flare">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-acid px-6 text-[11px] font-extrabold text-ink disabled:opacity-60"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        حفظ الإعدادات
      </button>
    </form>
  );
}
