import Link from "next/link";
import { ArrowLeft, Orbit } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative grid min-h-[80vh] place-items-center overflow-hidden px-5 pb-16 pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 50% 40%, #16163a, #05050b 70%)" }} />
        <div className="bg-grid absolute inset-0 opacity-15" />
      </div>

      <div className="relative text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-dashed border-acid/30 text-acid animate-spin-slow">
          <Orbit size={30} />
        </span>
        <p className="mt-6 font-display text-7xl font-black text-gradient-acid sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-extrabold sm:text-3xl">
          هذه الصفحة في بُعد آخر… غير موجود
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/45">
          ربما عبرت بوابة خاطئة. عُد إلى الحلبة الرئيسية واختر طريقك من جديد.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-acid px-6 py-3.5 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5"
        >
          العودة للرئيسية
          <ArrowLeft size={16} />
        </Link>
      </div>
    </div>
  );
}
