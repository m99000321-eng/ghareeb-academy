"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Menu, ShoppingBag, X } from "lucide-react";
import { Logo } from "./Logo";
import { useCart, selectCartCount } from "@/lib/store";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/shop", label: "المتجر" },
  { href: "/shop?category=kickboxing", label: "كيك بوكس" },
  { href: "/shop?category=boxing", label: "بوكس" },
  { href: "/shop?category=kungfu", label: "كونغ فو" },
  { href: "/shop?category=mma", label: "إم إم إيه" },
  { href: "/contact", label: "تواصل" },
];

export function Navbar() {
  const pathname = usePathname();
  const count = useCart(selectCartCount);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "transition-all duration-500",
          scrolled || open
            ? "border-b border-white/10 bg-ink/80 backdrop-blur-2xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="container-x flex h-20 items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-6 xl:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-2 text-[13px] font-semibold transition-colors",
                  isActive(link.href) && link.label !== "المتجر"
                    ? "text-acid"
                    : "text-white/65 hover:text-white",
                )}
              >
                {link.label}
                {isActive(link.href) && link.label !== "المتجر" ? (
                  <span className="absolute inset-x-0 -bottom-0.5 mx-auto h-px w-4 bg-acid" />
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/cart"
              aria-label="سلة المشتريات"
              className="relative grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-acid/60 hover:text-acid"
            >
              <ShoppingBag size={18} />
              {mounted && count > 0 ? (
                <span className="absolute -left-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-acid px-1 text-[10px] font-extrabold text-ink">
                  {count}
                </span>
              ) : null}
            </Link>

            <Link
              href="/shop"
              className="hidden items-center gap-2 rounded-full bg-acid px-5 py-3 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5 hover:bg-[#d8ff5e] sm:inline-flex"
            >
              تسوّق الآن
              <ArrowLeft size={16} />
            </Link>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={open}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white xl:hidden"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-20 z-40 max-h-[calc(100svh-5rem)] overflow-y-auto border-b border-white/10 bg-ink/95 backdrop-blur-2xl xl:hidden"
          >
            <div className="container-x flex flex-col gap-1 py-6">
              {links.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center justify-between border-b border-white/[0.06] py-4 text-lg font-bold text-white/85 transition-colors hover:text-acid"
                >
                  <span className="flex items-center gap-4">
                    <span className="font-mono text-[10px] text-white/30">
                      0{index + 1}
                    </span>
                    {link.label}
                  </span>
                  <ArrowLeft
                    size={18}
                    className="text-white/25 transition-transform group-hover:-translate-x-1 group-hover:text-acid"
                  />
                </Link>
              ))}
              <Link
                href="/shop"
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-acid px-6 py-4 text-sm font-extrabold text-ink"
              >
                ادخل المتجر
                <ArrowLeft size={16} />
              </Link>
              <p className="pt-5 text-center text-xs text-white/35">
                الغريب — معدات قتالية من بُعد آخر
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
