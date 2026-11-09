import Link from "next/link";
import { Phone, Search, Users } from "lucide-react";
import { getOrders } from "@/lib/db";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

type CustomerRow = {
  phone: string;
  name: string;
  city: string;
  orders: number;
  paidOrders: number;
  spent: number;
  lastOrder: string;
};

export default async function AdminCustomersPage() {
  const orders = await getOrders();
  const map = new Map<string, CustomerRow>();

  for (const order of orders) {
    const key = order.customer.phone;
    const existing = map.get(key);
    const paid = order.paymentStatus === "paid";
    if (!existing) {
      map.set(key, {
        phone: key,
        name: order.customer.name,
        city: order.customer.city,
        orders: 1,
        paidOrders: paid ? 1 : 0,
        spent: paid ? order.total : 0,
        lastOrder: order.createdAt,
      });
    } else {
      existing.orders += 1;
      if (paid) {
        existing.paidOrders += 1;
        existing.spent += order.total;
      }
      if (order.createdAt > existing.lastOrder) {
        existing.name = order.customer.name;
        existing.city = order.customer.city;
        existing.lastOrder = order.createdAt;
      }
    }
  }

  const customers = [...map.values()].sort((a, b) =>
    b.lastOrder.localeCompare(a.lastOrder),
  );

  const dateFormat = new Intl.DateTimeFormat("ar-EG", {
    timeZone: "Africa/Cairo",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const totalSpent = customers.reduce((sum, customer) => sum + customer.spent, 0);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[10px] font-bold tracking-[0.3em] text-acid">CUSTOMERS</p>
        <h1 className="mt-2 font-display text-3xl font-black">العملاء</h1>
        <p className="mt-2 text-xs text-white/40">
          {customers.length} عميل — إجمالي مشتريات {formatPrice(totalSpent)} ر.س
        </p>
      </header>

      {customers.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-white/15 py-16 text-center">
          <Users size={26} className="text-white/25" />
          <p className="mt-3 text-sm font-bold text-white/60">لا عملاء بعد</p>
          <p className="mt-1 text-[11px] text-white/30">
            سيظهر العملاء هنا تلقائيًا مع أول طلب.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="hidden grid-cols-[1.4fr_1fr_0.6fr_0.8fr_0.8fr_0.5fr] gap-3 border-b border-white/8 px-4 py-3 text-[9px] font-bold text-white/30 lg:grid">
            <span>العميل</span>
            <span>الهاتف</span>
            <span>الطلبات</span>
            <span>المدفوعة</span>
            <span>إجمالي الشراء</span>
            <span>آخر طلب</span>
          </div>
          <div className="divide-y divide-white/5">
            {customers.map((customer) => (
              <div
                key={customer.phone}
                className="grid gap-2 px-4 py-3.5 lg:grid-cols-[1.4fr_1fr_0.6fr_0.8fr_0.8fr_0.5fr] lg:items-center lg:gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.06] text-[11px] font-bold text-acid">
                    {customer.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold text-white/80">
                      {customer.name}
                    </p>
                    <p className="text-[9px] text-white/30">{customer.city}</p>
                  </div>
                </div>
                <a
                  href={`tel:${customer.phone}`}
                  className="flex items-center gap-1.5 text-[10px] text-white/45 hover:text-acid"
                  dir="ltr"
                >
                  <Phone size={11} />
                  {customer.phone}
                </a>
                <p className="text-[11px] font-bold text-white/70">
                  {customer.orders}
                </p>
                <p className="text-[11px] text-white/50">{customer.paidOrders}</p>
                <p className="text-[11px] font-bold text-acid">
                  {formatPrice(customer.spent)} ر.س
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] text-white/30">
                    {dateFormat.format(new Date(customer.lastOrder))}
                  </span>
                  <Link
                    href={`/admin/orders?q=${encodeURIComponent(customer.phone)}`}
                    aria-label="طلبات العميل"
                    className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-white/30 hover:border-acid/40 hover:text-acid"
                  >
                    <Search size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
