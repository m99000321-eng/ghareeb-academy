import { KeyRound, Database, ShieldCheck } from "lucide-react";
import { getSettings, storageInfo } from "@/lib/db";
import { isDefaultAdminPassword } from "@/lib/admin-auth";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  const storage = storageInfo();

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[10px] font-bold tracking-[0.3em] text-acid">SETTINGS</p>
        <h1 className="mt-2 font-display text-3xl font-black">الإعدادات</h1>
        <p className="mt-2 text-xs text-white/40">
          تحكّم في الشحن والرسوم وطرق الدفع وبيانات التحويل.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <p className="flex items-center gap-2 text-[10px] font-bold text-white/40">
            <Database size={14} className="text-cyan-300" />
            التخزين
          </p>
          <p
            className={`mt-2 text-[10px] font-bold ${
              storage.durable ? "text-emerald-300" : "text-amber-300"
            }`}
          >
            {storage.label}
          </p>
          <p className="mt-1 text-[9px] leading-5 text-white/30">
            {storage.driver === "redis"
              ? "البيانات دائمة ومشتركة بين كل نسخ الموقع."
              : storage.driver === "file"
                ? "البيانات محفوظة في data/db.json على السيرفر المحلي."
                : "اربط Upstash KV لضمان بقاء الطلبات بعد إعادة النشر."}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <p className="flex items-center gap-2 text-[10px] font-bold text-white/40">
            <ShieldCheck size={14} className="text-acid" />
            كلمة مرور الإدارة
          </p>
          <p
            className={`mt-2 text-[10px] font-bold ${
              isDefaultAdminPassword() ? "text-amber-300" : "text-emerald-300"
            }`}
          >
            {isDefaultAdminPassword() ? "كلمة المرور الافتراضية مستخدمة" : "كلمة مرور مخصّصة"}
          </p>
          <p className="mt-1 text-[9px] leading-5 text-white/30">
            عيّن <code className="rounded bg-black/30 px-1">ADMIN_PASSWORD</code>{" "}
            و<code className="rounded bg-black/30 px-1">ADMIN_SECRET</code> في
            متغيرات Vercel.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <p className="flex items-center gap-2 text-[10px] font-bold text-white/40">
            <KeyRound size={14} className="text-gold" />
            بوابات الدفع
          </p>
          <p className="mt-2 text-[10px] font-bold text-violet-300">
            المحاكاة مفعّلة للبوابات الإلكترونية
          </p>
          <p className="mt-1 text-[9px] leading-5 text-white/30">
            أضف مفاتيح Paymob / Stripe / PayPal لتفعيل التحصيل الحقيقي عبر نفس
            الواجهة.
          </p>
        </div>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
