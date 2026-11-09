"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  LayoutGrid,
  Mail,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "لوحة التحكم", icon: BarChart3 },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/admin/products", label: "المنتجات والمخزون", icon: LayoutGrid },
  { href: "/admin/payments", label: "المدفوعات", icon: CreditCard },
  { href: "/admin/customers", label: "العملاء", icon: Users },
  { href: "/admin/messages", label: "الرسائل والاشتراكات", icon: Mail },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-bold transition-colors",
              active
                ? "bg-acid text-ink"
                : "text-white/55 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon size={17} className={active ? "text-ink" : "text-white/35"} />
            {link.label}
            {active ? (
              <span className="ms-auto h-1.5 w-1.5 rounded-full bg-ink/60" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
