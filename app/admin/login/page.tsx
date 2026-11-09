import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Fingerprint, LockKeyhole, ShieldCheck } from "lucide-react";
import { isAdmin } from "@/lib/admin-guard";
import { isDefaultAdminPassword } from "@/lib/admin-auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "دخول لوحة التحكم",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const params = await searchParams;
  const next =
    typeof params.next === "string" && params.next.startsWith("/admin")
      ? params.next
      : "/admin";

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(200,255,46,0.10), transparent 70%)",
        }}
      />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.08]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="relative grid h-20 w-20 place-items-center">
            <span className="absolute inset-0 rotate-45 rounded-[22px] border border-gold/30" />
            <Image
              src="/brand/logo.png"
              alt="الغريب"
              width={112}
              height={112}
              priority
              className="relative h-[70px] w-[70px] rounded-full object-cover ring-1 ring-gold/50"
            />
          </span>
          <h1 className="mt-5 font-display text-2xl font-black">لوحة تحكم الغريب</h1>
          <p className="mt-2 text-xs text-white/40">
            نظام إدارة الطلبات والمدفوعات والمخزون
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur sm:p-8">
          <LoginForm next={next} />
        </div>

        {isDefaultAdminPassword() ? (
          <p className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-center text-[10px] leading-5 text-amber-200">
            كلمة المرور الافتراضية:{" "}
            <span className="font-mono font-bold">ghareeb2026</span> — عيّن
            المتغير <code className="rounded bg-black/30 px-1">ADMIN_PASSWORD</code>{" "}
            على Vercel لتغييرها.
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-center gap-5 text-[10px] font-bold text-white/30">
          <span className="flex items-center gap-1.5">
            <LockKeyhole size={12} /> جلسة مشفّرة
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={12} /> حماية ضد المحاولات المتكررة
          </span>
          <span className="flex items-center gap-1.5">
            <Fingerprint size={12} /> وصول خاص
          </span>
        </div>
      </div>
    </div>
  );
}
