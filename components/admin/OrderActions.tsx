"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw, Save, X } from "lucide-react";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_ORDER,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_ORDER,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/commerce-types";

const inputClass =
  "h-10 w-full rounded-xl border border-white/12 bg-black/30 px-3 text-[11px] text-white outline-none focus:border-acid/50";

export function OrderActions({
  orderId,
  status,
  paymentStatus,
  tracking,
  adminNotes,
}: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  tracking: string;
  adminNotes: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    status,
    paymentStatus,
    tracking,
    adminNotes,
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy("save");
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error ?? "تعذّر الحفظ");
      setMessage("تم حفظ تحديثات الطلب");
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "تعذّر حفظ التحديثات",
      );
    } finally {
      setBusy(null);
    }
  }

  async function paymentAction(action: "confirm" | "reject" | "refund") {
    if (busy) return;
    const labels = {
      confirm: "تأكيد استلام الدفع",
      reject: "رفض إثبات الدفع",
      refund: "تسجيل استرداد المبلغ",
    } as const;
    if (!window.confirm(`${labels[action]}؟`)) return;
    setBusy(action);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/payments/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error ?? "تعذّر تنفيذ الإجراء");
      setMessage("تم تحديث حالة الدفع");
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "تعذّر تنفيذ الإجراء",
      );
    } finally {
      setBusy(null);
    }
  }

  const showReview = paymentStatus === "review" || paymentStatus === "pending";
  const showRefund = paymentStatus === "paid";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <h2 className="font-display text-base font-extrabold">إدارة الطلب</h2>
      <form onSubmit={save} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-[10px] font-bold text-white/40">حالة الطلب</span>
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as OrderStatus,
                }))
              }
              className={`mt-1.5 ${inputClass}`}
            >
              {ORDER_STATUS_ORDER.map((item) => (
                <option key={item} value={item}>
                  {ORDER_STATUS_LABELS[item]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-white/40">حالة الدفع</span>
            <select
              value={form.paymentStatus}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  paymentStatus: event.target.value as PaymentStatus,
                }))
              }
              className={`mt-1.5 ${inputClass}`}
            >
              {PAYMENT_STATUS_ORDER.map((item) => (
                <option key={item} value={item}>
                  {PAYMENT_STATUS_LABELS[item]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-[10px] font-bold text-white/40">
            رقم الشحنة / التتبع
          </span>
          <input
            value={form.tracking}
            onChange={(event) =>
              setForm((current) => ({ ...current, tracking: event.target.value }))
            }
            placeholder="مثال: ARAMEX-123456"
            className={`mt-1.5 ${inputClass}`}
          />
        </label>

        <label className="block">
          <span className="text-[10px] font-bold text-white/40">
            ملاحظات داخلية (لا تظهر للعميل)
          </span>
          <textarea
            value={form.adminNotes}
            onChange={(event) =>
              setForm((current) => ({ ...current, adminNotes: event.target.value }))
            }
            rows={3}
            className="mt-1.5 w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2.5 text-[11px] text-white outline-none focus:border-acid/50"
          />
        </label>

        <button
          type="submit"
          disabled={busy !== null}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-acid text-[11px] font-extrabold text-ink disabled:opacity-60"
        >
          {busy === "save" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          حفظ التحديثات
        </button>
      </form>

      {showReview || showRefund ? (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-[10px] font-bold text-white/35">إجراءات الدفع</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {showReview ? (
              <>
                <button
                  type="button"
                  onClick={() => paymentAction("confirm")}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-acid/30 bg-acid/10 px-3 py-2 text-[10px] font-bold text-acid disabled:opacity-50"
                >
                  <Check size={12} />
                  تأكيد استلام الدفع
                </button>
                <button
                  type="button"
                  onClick={() => paymentAction("reject")}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-flare/30 bg-flare/10 px-3 py-2 text-[10px] font-bold text-flare disabled:opacity-50"
                >
                  <X size={12} />
                  رفض الإثبات
                </button>
              </>
            ) : null}
            {showRefund ? (
              <button
                type="button"
                onClick={() => paymentAction("refund")}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded-lg border border-violet/30 bg-violet/10 px-3 py-2 text-[10px] font-bold text-violet-300 disabled:opacity-50"
              >
                <RotateCcw size={12} />
                تسجيل استرداد
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="mt-3 rounded-lg border border-acid/20 bg-acid/[0.06] px-3 py-2 text-[10px] text-acid">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-lg border border-flare/25 bg-flare/[0.07] px-3 py-2 text-[10px] text-flare">
          {error}
        </p>
      ) : null}
    </div>
  );
}
