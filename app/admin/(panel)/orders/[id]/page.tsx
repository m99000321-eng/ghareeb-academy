import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  MapPin,
  MessageCircle,
  Phone,
  ReceiptText,
  Truck,
} from "lucide-react";
import { getOrder, getPaymentEvents } from "@/lib/db";
import { formatPrice } from "@/lib/products";
import { getPaymentMethod } from "@/lib/payments";
import {
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/commerce-types";
import { PaymentIcon } from "@/components/admin/PaymentIcon";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/StatusBadge";
import { OrderActions } from "@/components/admin/OrderActions";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("ar-EG", {
  timeZone: "Africa/Cairo",
  dateStyle: "medium",
  timeStyle: "short",
});

const eventLabels: Record<string, string> = {
  created: "إنشاء الطلب",
  simulated: "محاكاة بوابة الدفع",
  submitted: "إرسال إثبات التحويل",
  confirmed: "تأكيد الدفع",
  rejected: "رفض إثبات الدفع",
  refunded: "استرداد",
};

const flow: OrderStatus[] = ["new", "confirmed", "packed", "shipped", "delivered"];

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();
  const events = await getPaymentEvents(order.id);
  const method = getPaymentMethod(order.payment);

  const flowWithPending: OrderStatus[] =
    order.status === "pending_payment"
      ? ["pending_payment", ...flow]
      : flow;
  const currentIndex = flow.indexOf(order.status);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white/35 hover:text-acid"
          >
            <ArrowRight size={13} />
            كل الطلبات
          </Link>
          <h1 className="mt-2 flex flex-wrap items-center gap-2 font-display text-2xl font-black">
            <span className="font-mono text-lg text-acid">{order.id}</span>
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </h1>
          <p className="mt-1.5 text-[10px] text-white/35">
            أُنشئ في {dateFormat.format(new Date(order.createdAt))}
          </p>
        </div>
        <div className="text-left">
          <p className="text-[9px] font-bold text-white/30">الإجمالي</p>
          <p className="font-display text-2xl font-black text-acid">
            {formatPrice(order.total)}
            <span className="ms-1 text-[10px] font-bold text-white/35">ر.س</span>
          </p>
        </div>
      </div>

      {order.status !== "cancelled" && order.status !== "returned" ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between gap-1">
            {flow.map((step, index) => {
              const done = currentIndex >= index;
              return (
                <div key={step} className="flex flex-1 items-center gap-1.5">
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full border text-[9px] font-bold ${
                        done
                          ? "border-acid bg-acid text-ink"
                          : "border-white/15 text-white/25"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`whitespace-nowrap text-[8px] font-bold ${
                        done ? "text-white/70" : "text-white/25"
                      }`}
                    >
                      {ORDER_STATUS_LABELS[step]}
                    </span>
                  </div>
                  {index < flow.length - 1 ? (
                    <span
                      className={`mb-4 h-px flex-1 ${
                        currentIndex > index ? "bg-acid/60" : "bg-white/10"
                      }`}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
          {flowWithPending.length > flow.length ? (
            <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2 text-[10px] text-amber-200">
              الطلب بانتظار إتمام الدفع قبل بدء التنفيذ.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2 border-b border-white/8 px-5 py-4">
              <ReceiptText size={16} className="text-acid" />
              <h2 className="font-display text-base font-extrabold">المنتجات</h2>
            </div>
            <div className="divide-y divide-white/5">
              {order.items.map((item) => (
                <div
                  key={item.slug}
                  className="flex items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold text-white/80">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-[9px] text-white/30">
                      {item.slug} — الكمية {item.qty}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] font-bold">
                    {formatPrice(item.price * item.qty)} ر.س
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-white/8 px-5 py-4 text-[11px]">
              <div className="flex justify-between text-white/45">
                <span>المجموع الفرعي</span>
                <span>{formatPrice(order.subtotal)} ر.س</span>
              </div>
              <div className="flex justify-between text-white/45">
                <span>الشحن</span>
                <span>
                  {order.shipping === 0 ? "مجاني" : `${formatPrice(order.shipping)} ر.س`}
                </span>
              </div>
              {order.codFee > 0 ? (
                <div className="flex justify-between text-white/45">
                  <span>رسوم الدفع عند الاستلام</span>
                  <span>{formatPrice(order.codFee)} ر.س</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-white/8 pt-2 font-bold">
                <span>الإجمالي</span>
                <span className="text-acid">{formatPrice(order.total)} ر.س</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-2">
              <PaymentIcon id={order.payment} size={16} className="text-gold" />
              <h2 className="font-display text-base font-extrabold">
                الدفع — {method.name}
              </h2>
            </div>
            <p className="mt-1 text-[10px] text-white/35">{method.description}</p>

            {order.transferRef ? (
              <p className="mt-3 rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-[10px] text-white/60">
                رقم التحويل المُدخل:{" "}
                <span className="font-mono font-bold text-white">
                  {order.transferRef}
                </span>
              </p>
            ) : null}

            <div className="mt-4 space-y-3">
              {events.length === 0 ? (
                <p className="text-[10px] text-white/30">لا توجد أحداث دفع بعد.</p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-acid/70" />
                    <div className="min-w-0 flex-1 border-b border-white/5 pb-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[10px] font-bold text-white/70">
                          {eventLabels[event.type] ?? event.type}
                        </p>
                        <span className="text-[9px] text-white/30">
                          {dateFormat.format(new Date(event.createdAt))}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[9px] text-white/35">
                        {formatPrice(event.amount)} ر.س
                        {event.reference ? ` — ${event.reference}` : ""}
                        {event.note ? ` — ${event.note}` : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <h2 className="font-display text-base font-extrabold">بيانات العميل</h2>
            <div className="mt-3 space-y-2.5 text-[11px]">
              <p className="font-bold text-white/85">{order.customer.name}</p>
              <a
                href={`tel:${order.customer.phone}`}
                className="flex items-center gap-2 text-white/50 hover:text-acid"
                dir="ltr"
              >
                <Phone size={12} />
                {order.customer.phone}
              </a>
              <a
                href={`https://wa.me/${order.customer.phone.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-white/50 hover:text-acid"
              >
                <MessageCircle size={12} />
                مراسلة واتساب
              </a>
              <p className="flex items-start gap-2 text-white/50">
                <MapPin size={12} className="mt-0.5 shrink-0" />
                {order.customer.city} — {order.customer.address}
              </p>
              {order.customer.email ? (
                <p className="text-white/40" dir="ltr">
                  {order.customer.email}
                </p>
              ) : null}
              {order.customer.notes ? (
                <p className="rounded-lg border border-white/8 bg-black/20 px-3 py-2 text-[10px] leading-5 text-white/50">
                  <span className="font-bold text-white/60">ملاحظة العميل: </span>
                  {order.customer.notes}
                </p>
              ) : null}
            </div>
          </section>

          {order.tracking ? (
            <section className="rounded-2xl border border-cyan/20 bg-cyan/[0.04] p-5">
              <p className="flex items-center gap-2 text-[10px] font-bold text-cyan-300">
                <Truck size={14} />
                رقم الشحنة
              </p>
              <p className="mt-2 font-mono text-sm font-bold text-white">
                {order.tracking}
              </p>
            </section>
          ) : null}

          <OrderActions
            orderId={order.id}
            status={order.status}
            paymentStatus={order.paymentStatus}
            tracking={order.tracking ?? ""}
            adminNotes={order.adminNotes ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
