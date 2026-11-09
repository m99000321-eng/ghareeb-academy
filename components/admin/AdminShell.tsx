"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, ShieldCheck, X } from "lucide-react";
import { AdminNav } from "./AdminNav";
import { LogoutButton } from "./LogoutButton";

export function AdminShell({
  children,
  storage,
}: {
  children: React.ReactNode;
  storage: { durable: boolean; label: string };
}) {
  const [open, setOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-4 py-5">
        <Image
          src="/brand/logo.png"
          alt="الغريب"
          width={48}
          height={48}
          className="h-11 w-11 rounded-full object-cover ring-1 ring-gold/50"
        />
        <span className="leading-none">
          <span className="block font-display text-lg font-extrabold text-white">
            الغريب
          </span>
          <span className="mt-1 block text-[8px] font-bold tracking-[0.3em] text-gold/70">
            STORE CONTROL
          </span>
        </span>
      </Link>

      <div className="mx-4 mb-4 flex items-center gap-2 rounded-xl border border-acid/20 bg-acid/[0.06] px-3 py-2 text-[10px] font-bold text-acid">
        <ShieldCheck size={13} />
        جلسة إدارة آمنة
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        <AdminNav />
      </div>

      <div className="space-y-2 border-t border-white/10 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[12px] font-bold text-white/45 transition-colors hover:bg-white/5 hover:text-acid"
        >
          <ArrowUpRight size={15} />
          فتح المتجر
        </Link>
        <LogoutButton />
        <div className="rounded-xl bg-white/[0.03] px-3 py-2.5">
          <p className="text-[9px] font-bold text-white/30">التخزين</p>
          <p
            className={`mt-1 text-[10px] font-bold ${
              storage.durable ? "text-emerald-300" : "text-amber-300"
            }`}
          >
            {storage.label}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink text-white">
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-[264px] border-l border-white/10 bg-ink-2/95 backdrop-blur lg:block">
        {sidebar}
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-ink/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image
            src="/brand/logo.png"
            alt="الغريب"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover ring-1 ring-gold/50"
          />
          <span className="font-display text-base font-extrabold">إدارة الغريب</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="فتح القائمة"
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/12 text-white/70"
        >
          <Menu size={18} />
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="إغلاق"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 w-[280px] border-l border-white/10 bg-ink-2 shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="إغلاق القائمة"
              className="absolute left-3 top-4 z-10 grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/60"
            >
              <X size={16} />
            </button>
            {sidebar}
          </div>
        </div>
      ) : null}

      <main className="lg:pr-[264px]">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {!storage.durable ? (
            <div className="mb-5 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3 text-[11px] leading-5 text-amber-200">
              تنبيه: البيانات حاليًا على تخزين مؤقت في Vercel وقد تُفقد عند إعادة
              النشر. اربط Upstash KV عبر متغيري{" "}
              <code className="rounded bg-black/30 px-1">KV_REST_API_URL</code> و
              <code className="rounded bg-black/30 px-1">KV_REST_API_TOKEN</code>{" "}
              لتفعيل التخزين الدائم.
            </div>
          ) : null}
          {children}
        </div>
      </main>
    </div>
  );
}
