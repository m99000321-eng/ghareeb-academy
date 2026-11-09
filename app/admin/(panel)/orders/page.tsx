import Link from "next/link";
import { ArrowLeft, Search, ShoppingBag } from "lucide-react";
import { getOrders } from "@/lib/db";
import { formatPrice } from "@/lib/products";
import { getPaymentMethod } from "@/lib/payments";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_ORDER,
  type OrderStatus,
} from "@/lib/commerce-types";
import { PaymentIcon } from "@/components/admin/PaymentIcon";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/StatusBadge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("ar-EG", {
  timeZone: "Africa/Cairo",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status =
    typeof params.status === "string" &&
    ORDER_STATUS_ORDER.includes(params.status as OrderStatus)
      ? (params.status as OrderStatus)
      : undefined;
  const query = typeof params.q === "string" ? params.q.trim() : "";

  const all = await getOrders();
  const filtered = all.filter((order) => {
    if (status && order.status !== status) return false;
    if (!query) return true;
    const haystack = [
      order.id,
      order.customer.name,
      order.customer.phone,
      order.customer.city,
      order.tracking ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const counts = new Map<OrderStatus, number>();
  for (const order of all) {
    counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.3em] text-acid">
            ORDERS
          </p>
          <h1 className="mt-2 font-display text-3xl font-black">الطلبات</h1>
          <p className="mt-2 text-xs text-white/40">
            {all.length} طلب إجمالًا — {filtered.length} مطابق
          </p>
        </div>
        <form action="/admin/orders" method="get" className="relative w-full sm:w-72">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <Search
            size={15}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            name="q"
            defaultValue={query}
            placeholder="ابحث برقم الطلب أو العميل…"
            className="h-11 w-full rounded-full border border-white/12 bg-white/[0.03] pe-4 ps-10 text-[11px] text-white outline-none placeholder:text-white/25 focus:border-acid/50"
          />
        </form>
      </header>

      <div className="flex flex-wrap gap-2">
        <Link
          href={query ? `/admin/orders?q=${encodeURIComponent(query)}` : "/admin/orders"}
          className={cn(
            "rounded-full border px-3.5 py-2 text-[10px] font-bold transition-colors",
            !status
              ? "border-white bg-white text-ink"
              : "border-white/12 text-white/50 hover:border-white/30 hover:text-white",
          )}
        >
          الكل ({all.length})
        </Link>
        {ORDER_STATUS_ORDER.map((item) => {
          const href = new URLSearchParams();
          href.set("status", item);
          if (query) href.set("q", query);
          return (
            <Link
              key={item}
              href={`/admin/orders?${href.toString()}`}
              className={cn(
                "rounded-full border px-3.5 py-2 text-[10px] font-bold transition-colors",
                status === item
                  ? "border-acid bg-acid text-ink"
                  : "border-white/12 text-white/50 hover:border-white/30 hover:text-white",
              )}
            >
              {ORDER_STATUS_LABELS[item]} ({counts.get(item) ?? 0})
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-white/15 py-16 text-center">
          <ShoppingBag size={26} className="text-white/25" />
          <p className="mt-3 text-sm font-bold text-white/60">لا توجد طلبات مطابقة</p>
          <p className="mt-1 text-[11px] text-white/30">
            جرّب تغيير الفلتر أو البحث بكلمة أخرى.
          </p>
          <Link
            href="/admin/orders"
            className="mt-5 rounded-full border border-white/15 px-5 py-2.5 text-[11px] font-bold text-white/60"
          >
            إعادة ضبط
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="hidden grid-cols-[1.1fr_1.4fr_0.7fr_1fr_1fr_0.9fr_0.5fr] gap-3 border-b border-white/8 px-4 py-3 text-[9px] font-bold tracking-wider text-white/30 lg:grid">
            <span>الطلب</span>
            <span>العميل</span>
            <span>الإجمالي</span>
            <span>الدفع</span>
            <span>حالة الطلب</span>
            <span>حالة الدفع</span>
            <span />
          </div>
          <div className="divide-y divide-white/5">
            {filtered.map((order) => {
              const method = getPaymentMethod(order.payment);
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="grid gap-2 px-4 py-4 transition-colors hover:bg-white/[0.03] lg:grid-cols-[1.1fr_1.4fr_0.7fr_1fr_1fr_0.9fr_0.5fr] lg:items-center lg:gap-3"
                >
                  <div>
                    <p className="font-mono text-[10px] font-bold text-white/60">
                      {order.id}
                    </p>
                    <p className="mt-1 text-[9px] text-white/30">
                      {dateFormat.format(new Date(order.createdAt))}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold text-white/80">
                      {order.customer.name}
                    </p>
                    <p className="mt-0.5 text-[9px] text-white/30" dir="ltr">
                      {order.customer.phone}
                    </p>
                  </div>
                  <p className="text-[11px] font-bold text-white/80">
                    {formatPrice(order.total)}{" "}
                    <span className="text-[9px] font-normal text-white/30">ر.س</span>
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/50">
                    <PaymentIcon id={order.payment} size={13} className="text-white/30" />
                    <span className="truncate">{method.name}</span>
                  </div>
                  <div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div>
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                  <span className="hidden justify-self-end text-white/25 lg:block">
                    <ArrowLeft size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
