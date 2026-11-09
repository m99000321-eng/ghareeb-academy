import Link from "next/link";
import { ArrowLeft, CreditCard, FlaskConical, Info } from "lucide-react";
import { getOrders, getPaymentEvents, getSettings } from "@/lib/db";
import { formatPrice } from "@/lib/products";
import { PAYMENT_METHODS, PAYMENT_SETUP_KEYS } from "@/lib/payments";
import { PaymentIcon } from "@/components/admin/PaymentIcon";
import { PaymentStatusBadge } from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("ar-EG", {
  timeZone: "Africa/Cairo",
  dateStyle: "short",
  timeStyle: "short",
});

const eventTypeLabels: Record<string, string> = {
  created: "إنشاء",
  simulated: "محاكاة",
  submitted: "إثبات تحويل",
  confirmed: "تأكيد",
  rejected: "رفض",
  refunded: "استرداد",
};

export default async function AdminPaymentsPage() {
  const [settings, orders, events] = await Promise.all([
    getSettings(),
    getOrders(),
    getPaymentEvents(),
  ]);

  const orderMap = new Map(orders.map((order) => [order.id, order]));
  const paidTotal = orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[10px] font-bold tracking-[0.3em] text-acid">PAYMENTS</p>
        <h1 className="mt-2 font-display text-3xl font-black">المدفوعات</h1>
        <p className="mt-2 text-xs text-white/40">
          {PAYMENT_METHODS.filter((method) => settings.methods[method.id]).length}{" "}
          طريقة مفعّلة — المحصّل {formatPrice(paidTotal)} ر.س —{" "}
          {events.length} عملية مسجلة
        </p>
      </header>

      <section className="rounded-2xl border border-violet/20 bg-violet/[0.05] p-4">
        <div className="flex items-start gap-3">
          <FlaskConical size={18} className="mt-0.5 shrink-0 text-violet-300" />
          <div className="text-[10px] leading-6 text-white/55">
            <p className="font-bold text-violet-300">وضع الدفع التجريبي الكامل</p>
            <p className="mt-1">
              البطاقات ومدى وApple Pay وSTC Pay والمحافظ وفوري وValu وPayPal تعمل
              الآن عبر بوابة محاكاة (نجاح/فشل) لاختبار التدفق من البداية للنهاية.
              للتحصيل الفعلي أضف مفاتيح بوابة الدفع على Vercel وسأوصّلها بنفس
              الواجهة — بدون أي تغيير في الواجهة أو لوحة التحكم.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {PAYMENT_METHODS.map((method) => {
          const enabled = settings.methods[method.id] !== false;
          const keys = PAYMENT_SETUP_KEYS[method.id] ?? [];
          const configured = keys.some((key) => Boolean(process.env[key]));
          return (
            <div
              key={method.id}
              className={`rounded-2xl border p-4 ${
                enabled
                  ? "border-white/10 bg-white/[0.025]"
                  : "border-white/5 bg-white/[0.01] opacity-55"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.04]">
                  <PaymentIcon id={method.id} size={17} className="text-acid" />
                </span>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[8px] font-bold ${
                    !enabled
                      ? "border-white/10 text-white/30"
                      : method.kind === "online"
                        ? "border-violet/25 bg-violet/10 text-violet-300"
                        : "border-acid/25 bg-acid/10 text-acid"
                  }`}
                >
                  {!enabled
                    ? "معطّلة"
                    : method.kind === "online"
                      ? configured
                        ? "مفاتيح موجودة — ربط قيد التفعيل"
                        : "محاكاة"
                      : method.kind === "manual"
                        ? "يدوي — تأكيد"
                        : "نشط"}
                </span>
              </div>
              <p className="mt-3 text-[11px] font-bold text-white/80">{method.name}</p>
              <p className="mt-1 text-[9px] leading-4 text-white/35">
                {method.description}
              </p>
              <p className="mt-2 font-mono text-[8px] text-white/25" dir="ltr">
                {method.nameEn}
              </p>
              {method.kind === "online" ? (
                <p className="mt-2 border-t border-white/5 pt-2 text-[8px] leading-4 text-white/25">
                  المفاتيح المطلوبة للتحصيل:{" "}
                  <span className="font-mono" dir="ltr">
                    {keys.join(" · ")}
                  </span>
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2 border-b border-white/8 px-5 py-4">
          <CreditCard size={16} className="text-gold" />
          <h2 className="font-display text-base font-extrabold">
            سجل عمليات الدفع
          </h2>
        </div>
        {events.length === 0 ? (
          <p className="px-5 py-10 text-center text-[11px] text-white/30">
            لا عمليات دفع بعد — ستظهر هنا مع أول طلب.
          </p>
        ) : (
          <div className="divide-y divide-white/5">
            {events.map((event) => {
              const order = orderMap.get(event.orderId);
              return (
                <Link
                  key={event.id}
                  href={`/admin/orders/${event.orderId}`}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.03]"
                >
                  <PaymentIcon
                    id={event.method}
                    size={15}
                    className="text-white/30"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[10px] text-white/55">
                      {event.orderId}
                      {order ? (
                        <span className="ms-2 font-body text-[9px] text-white/30">
                          {order.customer.name}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[9px] text-white/30">
                      {eventTypeLabels[event.type] ?? event.type} —{" "}
                      {dateFormat.format(new Date(event.createdAt))}
                      {event.reference ? ` — ${event.reference}` : ""}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-white/60">
                    {formatPrice(event.amount)} ر.س
                  </span>
                  <div className="flex items-center gap-2">
                    <PaymentStatusBadge status={event.status} />
                    <ArrowLeft size={12} className="text-white/20" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-extrabold">
          <Info size={15} className="text-cyan-300" />
          طريقة ربط بوابة دفع حقيقية
        </h2>
        <ol className="mt-3 space-y-2 text-[10px] leading-6 text-white/45">
          <li>1 — افتح حساب تاجر على Paymob (مصر) أو Stripe / Moyasar (السعودية) أو PayPal.</li>
          <li>
            2 — أضف مفاتيح الحساب إلى متغيرات Vercel:{" "}
            <code className="rounded bg-black/30 px-1" dir="ltr">
              PAYMOB_API_KEY
            </code>{" "}
            و{" "}
            <code className="rounded bg-black/30 px-1" dir="ltr">
              PAYMOB_IFRAME_ID
            </code>{" "}
            (أو{" "}
            <code className="rounded bg-black/30 px-1" dir="ltr">
              STRIPE_SECRET_KEY
            </code>
            ).
          </li>
          <li>3 — أبلغني لتفعيل استدعاء البوابة الفعلي وwebhook تأكيد الدفع؛ الواجهة والطلبات جاهزة بالفعل.</li>
          <li>
            4 — طرق التحويل اليدوي (إنستاباي/تحويل بنكي) تعمل الآن: العميل يرسل رقم
            العملية وتؤكّدها أنت من صفحة الطلب.
          </li>
        </ol>
      </section>
    </div>
  );
}
