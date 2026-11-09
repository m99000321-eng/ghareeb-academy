import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock3,
  CreditCard,
  MapPin,
  Truck,
} from "lucide-react";
import { getOrder } from "@/lib/db";
import { formatPrice } from "@/lib/products";
import { getPaymentMethod } from "@/lib/payments";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/commerce-types";
import { PaymentIcon } from "@/components/admin/PaymentIcon";

export const metadata: Metadata = {
  title: "تأكيد الطلب",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("ar-EG", {
  timeZone: "Africa/Cairo",
  dateStyle: "long",
  timeStyle: "short",
});

const flow: OrderStatus[] = ["new", "confirmed", "packed", "shipped", "delivered"];

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const method = getPaymentMethod(order.payment);
  const paid = order.paymentStatus === "paid";
  const review = order.paymentStatus === "review";
  const pending = ["pending", "unpaid", "failed"].includes(order.paymentStatus);
  const cancelled = order.status === "cancelled" || order.status === "returned";
  const currentIndex = flow.indexOf(order.status);

  return (
    <div className="relative overflow-hidden pb-20 pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-x-0 top-0 h-96"
          style={{
            background: paid
              ? "radial-gradient(70% 100% at 50% 0%, rgba(200,255,46,0.13), transparent 70%)"
              : "radial-gradient(70% 100% at 50% 0%, rgba(217,180,91,0.10), transparent 70%)",
          }}
        />
        <div className="bg-grid absolute inset-0 opacity-[0.07]" />
      </div>

      <div className="container-x relative max-w-3xl">
        <div className="text-center">
          <span
            className={`relative mx-auto grid h-20 w-20 place-items-center rounded-full border ${
              paid || (method.kind === "cod" && !cancelled)
                ? "border-acid/30 bg-acid/10"
                : "border-gold/30 bg-gold/10"
            }`}
          >
            {paid || method.kind === "cod" ? (
              <Check
                size={32}
                className={paid || method.kind === "cod" ? "text-acid" : "text-gold"}
              />
            ) : (
              <Clock3 size={30} className="text-gold" />
            )}
          </span>

          <p className="mt-5 font-mono text-[10px] tracking-widest text-white/30">
            {order.id}
          </p>
          <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">
            {cancelled ? (
              <>تم إلغاء الطلب</>
            ) : paid ? (
              <>
                تم الدفع و<span className="text-gradient-acid">تأكيد طلبك</span>
              </>
            ) : review ? (
              <>
                تحويلك <span className="text-gradient-acid">قيد المراجعة</span>
              </>
            ) : method.kind === "cod" ? (
              <>
                وصل طلبك إلى <span className="text-gradient-acid">البُعد الآخر</span>
              </>
            ) : (
              <>
                طلبك محفوظ — <span className="text-gradient-acid">أكمل الدفع</span>
              </>
            )}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/45">
            {cancelled
              ? "تم إلغاء هذا الطلب. تواصل معنا إن كان ذلك غير متوقع."
              : paid
                ? `شكرًا ${order.customer.name}. استلمنا مبلغ الطلب وسنبدأ تجهيزه فورًا.`
                : review
                  ? "استلمنا رقم عملية التحويل وسيتأكد فريقنا من المبلغ ثم يبدأ تجهيز الطلب."
                  : method.kind === "cod"
                    ? `شكرًا ${order.customer.name}. سيتواصل فريق الغريب معك لتأكيد التفاصيل قبل الشحن.`
                    : "لم يكتمل الدفع بعد. يمكنك إكماله الآن — طلبك وأسعاره محفوظة."}
          </p>

          {pending ? (
            <Link
              href={`/pay/${order.id}`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5"
            >
              <CreditCard size={16} />
              إكمال الدفع الآن
            </Link>
          ) : null}
        </div>

        {!cancelled ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between gap-1">
              {flow.map((step, index) => {
                const done = currentIndex >= index;
                return (
                  <div key={step} className="flex flex-1 items-center gap-1.5">
                    <div className="flex flex-col items-center gap-1.5">
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-full border text-[10px] font-bold ${
                          done
                            ? "border-acid bg-acid text-ink"
                            : "border-white/15 text-white/25"
                        }`}
                      >
                        {done ? <Check size={12} /> : index + 1}
                      </span>
                      <span
                        className={`whitespace-nowrap text-[9px] font-bold ${
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
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-extrabold">تفاصيل الطلب</h2>
            <p className="mt-1 text-[10px] text-white/30">
              {dateFormat.format(new Date(order.createdAt))}
            </p>
            <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
              {order.items.map((item) => (
                <div
                  key={item.slug}
                  className="flex items-start justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white/80">{item.name}</p>
                    <p className="mt-0.5 text-[10px] text-white/30">
                      الكمية: {item.qty}
                    </p>
                  </div>
                  <span className="shrink-0 font-bold">
                    {formatPrice(item.price * item.qty)} ر.س
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-[11px]">
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
                  <span>رسوم الاستلام</span>
                  <span>{formatPrice(order.codFee)} ر.س</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-white/10 pt-2 font-bold">
                <span>الإجمالي</span>
                <span className="text-acid">{formatPrice(order.total)} ر.س</span>
              </div>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="font-display text-lg font-extrabold">الدفع والتوصيل</h2>
              <div className="mt-4 space-y-3 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-white/45">
                    <PaymentIcon id={order.payment} size={14} className="text-gold" />
                    {method.name}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                      paid
                        ? "border-acid/30 bg-acid/10 text-acid"
                        : review
                          ? "border-gold/30 bg-gold/10 text-gold"
                          : "border-white/15 text-white/45"
                    }`}
                  >
                    {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                  </span>
                </div>
                {order.transferRef ? (
                  <p className="text-[10px] text-white/35">
                    رقم التحويل:{" "}
                    <span className="font-mono text-white/70">{order.transferRef}</span>
                  </p>
                ) : null}
                <p className="flex items-start gap-2 text-white/45">
                  <MapPin size={13} className="mt-0.5 shrink-0" />
                  {order.customer.city} — {order.customer.address}
                </p>
                <p className="text-white/45">{order.customer.phone}</p>
                {order.tracking ? (
                  <p className="flex items-center gap-2 rounded-xl border border-cyan/20 bg-cyan/[0.05] px-3 py-2 text-[10px] text-cyan-200">
                    <Truck size={13} />
                    رقم الشحنة:{" "}
                    <span className="font-mono font-bold">{order.tracking}</span>
                  </p>
                ) : null}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="font-display text-lg font-extrabold">ماذا بعد؟</h2>
              <ul className="mt-3 space-y-2 text-[11px] leading-6 text-white/45">
                <li className="flex gap-2">
                  <span className="text-acid">•</span>
                  تجهيز طلبك خلال 24 ساعة من تأكيد الدفع.
                </li>
                <li className="flex gap-2">
                  <span className="text-acid">•</span>
                  شحن سريع خلال 48 ساعة مع رقم تتبع.
                </li>
                <li className="flex gap-2">
                  <span className="text-acid">•</span>
                  للاستفسار: تواصل معنا من صفحة التواصل.
                </li>
              </ul>
            </section>
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
