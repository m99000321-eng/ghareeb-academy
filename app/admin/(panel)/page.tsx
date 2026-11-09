import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Boxes,
  Clock3,
  Mail,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  getMessages,
  getOrders,
  getPaymentEvents,
  getSettings,
  storageInfo,
} from "@/lib/db";
import { getAdminCatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/products";
import { PAYMENT_METHODS } from "@/lib/payments";
import { PaymentIcon } from "@/components/admin/PaymentIcon";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

const cairoDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Cairo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dayKey(iso: string): string {
  return cairoDay.format(new Date(iso));
}

function shortDate(value: string): string {
  return new Intl.DateTimeFormat("ar-EG", {
    timeZone: "Africa/Cairo",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminDashboardPage() {
  const [orders, events, messages, catalog, settings] = await Promise.all([
    getOrders(),
    getPaymentEvents(),
    getMessages(),
    getAdminCatalog(),
    getSettings(),
  ]);

  const today = cairoDay.format(new Date());
  const todayOrders = orders.filter((order) => dayKey(order.createdAt) === today);
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
  const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const openOrders = orders.filter((order) =>
    ["pending_payment", "new", "confirmed", "packed"].includes(order.status),
  );
  const reviewOrders = orders.filter(
    (order) => order.paymentStatus === "review",
  );
  const lowStock = catalog.filter(
    (product) => product.active !== false && product.stock <= 5,
  );

  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    return cairoDay.format(date);
  });
  const daily = days.map((day) => {
    const paid = paidOrders.filter((order) => dayKey(order.createdAt) === day);
    return {
      day,
      total: paid.reduce((sum, order) => sum + order.total, 0),
      count: paid.length,
    };
  });
  const maxDaily = Math.max(1, ...daily.map((item) => item.total));

  const methodTotals = PAYMENT_METHODS.map((method) => {
    const items = paidOrders.filter((order) => order.payment === method.id);
    return {
      ...method,
      count: items.length,
      total: items.reduce((sum, order) => sum + order.total, 0),
    };
  })
    .filter((item) => item.count > 0)
    .sort((a, b) => b.total - a.total);

  const recent = orders.slice(0, 7);
  const recentEvents = events.slice(0, 5);

  const stats = [
    {
      label: "إجمالي المحصّل",
      value: `${formatPrice(revenue)} ر.س`,
      note: `${paidOrders.length} طلب مدفوع`,
      icon: Banknote,
      tone: "text-acid",
    },
    {
      label: "طلبات اليوم",
      value: String(todayOrders.length),
      note: `${formatPrice(
        todayOrders.reduce((sum, order) => sum + order.total, 0),
      )} ر.س`,
      icon: ShoppingBag,
      tone: "text-cyan-300",
    },
    {
      label: "طلبات قيد التنفيذ",
      value: String(openOrders.length),
      note: `${reviewOrders.length} بانتظار مراجعة الدفع`,
      icon: Clock3,
      tone: "text-amber-300",
    },
    {
      label: "مخزون منخفض",
      value: String(lowStock.length),
      note: `من أصل ${catalog.length} منتج`,
      icon: Boxes,
      tone: lowStock.length > 0 ? "text-flare" : "text-emerald-300",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.3em] text-acid">
            STORE CONTROL
          </p>
          <h1 className="mt-2 font-display text-3xl font-black">لوحة التحكم</h1>
          <p className="mt-2 text-xs text-white/40">
            نظرة شاملة على المبيعات والطلبات والمخزون — {storageInfo().label}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 rounded-full bg-acid px-4 py-2.5 text-[11px] font-extrabold text-ink"
          >
            إدارة الطلبات
            <ArrowLeft size={14} />
          </Link>
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-[11px] font-bold text-white/70 hover:border-white/35 hover:text-white"
          >
            المدفوعات
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold text-white/40">
                  {stat.label}
                </span>
                <Icon size={18} className={stat.tone} />
              </div>
              <p className="mt-3 font-display text-2xl font-black">{stat.value}</p>
              <p className="mt-1 text-[10px] text-white/35">{stat.note}</p>
            </div>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-acid/25 bg-acid/[0.04] p-6 text-center">
          <TrendingUp className="mx-auto text-acid/70" size={26} />
          <h2 className="mt-3 font-display text-lg font-extrabold">
            المتجر جاهز لأول طلب
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-[11px] leading-6 text-white/45">
            أنشئ طلبًا تجريبيًا من صفحة إتمام الطلب في المتجر لتظهر هنا. جميع
            طرق الدفع مفعّلة ويمكنك تعطيل أي منها من الإعدادات.
          </p>
          <Link
            href="/checkout"
            target="_blank"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-acid/40 px-5 py-2.5 text-[11px] font-bold text-acid"
          >
            تجربة إتمام طلب
            <ArrowLeft size={13} />
          </Link>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold">مبيعات 14 يومًا</h2>
            <span className="text-[10px] text-white/35">الطلبات المدفوعة فقط</span>
          </div>
          <div className="mt-6 flex h-44 items-end gap-1.5" dir="ltr">
            {daily.map((item) => {
              const height = Math.max(4, Math.round((item.total / maxDaily) * 100));
              return (
                <div
                  key={item.day}
                  className="group relative flex h-full flex-1 flex-col justify-end"
                  title={`${item.day} — ${item.total} ر.س (${item.count} طلب)`}
                >
                  <div
                    className="rounded-t-md bg-gradient-to-t from-acid/25 to-acid transition-opacity group-hover:opacity-80"
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[9px] text-white/25">
            <span>{daily[0]?.day.slice(5)}</span>
            <span>{daily[Math.floor(daily.length / 2)]?.day.slice(5)}</span>
            <span>{daily[daily.length - 1]?.day.slice(5)}</span>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <h2 className="font-display text-lg font-extrabold">توزيع طرق الدفع</h2>
          {methodTotals.length === 0 ? (
            <p className="mt-6 text-[11px] text-white/35">
              لا توجد مدفوعات بعد — ستظهر النسب هنا.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {methodTotals.slice(0, 5).map((method) => {
                const share = Math.round((method.total / Math.max(1, revenue)) * 100);
                return (
                  <div key={method.id}>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-2 font-bold text-white/70">
                        <PaymentIcon id={method.id} size={14} className="text-white/35" />
                        {method.name}
                        <span className="text-[9px] text-white/30">
                          {method.count}
                        </span>
                      </span>
                      <span className="text-white/45">{share}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{ width: `${Math.max(3, share)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3.5 py-3 text-[10px]">
            <span className="flex items-center gap-2 text-white/40">
              <TrendingUp size={13} className="text-acid" />
              متوسط قيمة الطلب
            </span>
            <span className="font-bold text-white">
              {formatPrice(
                paidOrders.length ? Math.round(revenue / paidOrders.length) : 0,
              )}{" "}
              ر.س
            </span>
          </div>
        </section>
      </div>

      {lowStock.length > 0 ? (
        <section className="rounded-2xl border border-flare/20 bg-flare/[0.04] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-base font-extrabold">
              <Boxes size={17} className="text-flare" />
              منتجات تحتاج إعادة تعبئة
            </h2>
            <Link
              href="/admin/products"
              className="text-[10px] font-bold text-flare/80 hover:text-flare"
            >
              إدارة المخزون ←
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {lowStock.slice(0, 8).map((product) => (
              <span
                key={product.slug}
                className="rounded-full border border-flare/20 bg-black/20 px-3 py-1.5 text-[10px] text-white/60"
              >
                {product.name}
                <span className="ms-1.5 font-bold text-flare">{product.stock}</span>
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <h2 className="font-display text-lg font-extrabold">أحدث الطلبات</h2>
            <Link
              href="/admin/orders"
              className="text-[10px] font-bold text-acid/80 hover:text-acid"
            >
              عرض الكل ←
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-8 text-center text-[11px] text-white/30">
              لا توجد طلبات بعد.
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {recent.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.03]"
                >
                  <span className="font-mono text-[10px] text-white/35">
                    {order.id}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-white/80">
                    {order.customer.name}
                  </span>
                  <OrderStatusBadge status={order.status} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                  <span className="text-[11px] font-bold text-white/70">
                    {formatPrice(order.total)} ر.س
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-base font-extrabold">
                <Users size={16} className="text-cyan-300" />
                آخر العملاء
              </h2>
              <Link
                href="/admin/customers"
                className="text-[10px] font-bold text-white/35 hover:text-white"
              >
                الكل ←
              </Link>
            </div>
            <div className="mt-3 space-y-2.5">
              {recent.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between text-[11px]"
                >
                  <span className="flex items-center gap-2 text-white/65">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-white/8 text-[10px] font-bold text-acid">
                      {order.customer.name.slice(0, 1)}
                    </span>
                    {order.customer.name}
                  </span>
                  <span className="text-white/30">{order.customer.city}</span>
                </div>
              ))}
              {recent.length === 0 ? (
                <p className="text-[10px] text-white/25">لا عملاء بعد.</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-base font-extrabold">
                <Mail size={16} className="text-gold" />
                رسائل جديدة
              </h2>
              <Link
                href="/admin/messages"
                className="text-[10px] font-bold text-white/35 hover:text-white"
              >
                الكل ←
              </Link>
            </div>
            <div className="mt-3 space-y-2.5">
              {messages.slice(0, 3).map((message) => (
                <div key={message.id} className="text-[11px]">
                  <p className="truncate font-bold text-white/65">
                    {message.subject}
                  </p>
                  <p className="mt-0.5 text-[9px] text-white/30">
                    {message.name} — {shortDate(message.createdAt)}
                  </p>
                </div>
              ))}
              {messages.length === 0 ? (
                <p className="text-[10px] text-white/25">لا رسائل بعد.</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-extrabold">
              <BadgeCheck size={16} className="text-acid" />
              آخر عمليات الدفع
            </h2>
            <div className="mt-3 space-y-2">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-2 text-[10px]"
                >
                  <PaymentIcon id={event.method} size={13} className="text-white/30" />
                  <span className="min-w-0 flex-1 truncate font-mono text-white/40">
                    {event.orderId}
                  </span>
                  <PaymentStatusBadge status={event.status} />
                </div>
              ))}
              {recentEvents.length === 0 ? (
                <p className="text-[10px] text-white/25">لا عمليات بعد.</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      <section className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:grid-cols-3">
        <div>
          <p className="text-[9px] font-bold tracking-[0.2em] text-white/25">
            SHIPPING
          </p>
          <p className="mt-1 text-[11px] font-bold text-white/70">
            {settings.shippingFee} ر.س — مجاني بعد{" "}
            {settings.freeShippingThreshold} ر.س
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold tracking-[0.2em] text-white/25">
            PAYMENT METHODS
          </p>
          <p className="mt-1 text-[11px] font-bold text-white/70">
            {PAYMENT_METHODS.filter((method) => settings.methods[method.id]).length}{" "}
            طريقة مفعّلة من {PAYMENT_METHODS.length}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold tracking-[0.2em] text-white/25">
            SUPPORT
          </p>
          <p className="mt-1 text-[11px] font-bold text-white/70" dir="ltr">
            {settings.whatsapp}
          </p>
        </div>
      </section>
    </div>
  );
}
