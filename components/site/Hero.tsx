import Link from "next/link";
import { ArrowLeft, ChevronDown, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { Scene3DClient } from "../three/Scene3DClient";

const stats = [
  { value: "4", label: "فنون قتالية" },
  { value: "+240", label: "منتج قطاعي" },
  { value: "48h", label: "توصيل سريع" },
];

const trust = [
  { icon: Truck, label: "شحن مجاني فوق 700 ر.س" },
  { icon: ShieldCheck, label: "ضمان أصلي 100%" },
  { icon: RotateCcw, label: "إرجاع خلال 30 يومًا" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pb-14 pt-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 85% at 50% -12%, #16163a 0%, #080812 45%, #05050b 70%)",
          }}
        />
        <div className="bg-grid absolute inset-0 opacity-[0.16]" />
        <div className="absolute -right-[12%] -top-24 h-[34rem] w-[34rem] rounded-full bg-violet/20 blur-[150px]" />
        <div className="absolute -bottom-24 -left-[8%] h-[28rem] w-[28rem] rounded-full bg-acid/10 blur-[140px]" />
        <div className="absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />
        <div className="absolute left-1/2 top-1/2 h-[52rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03]" />
      </div>

      <div className="container-x relative grid items-center gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-4">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-acid/25 bg-acid/[0.06] px-4 py-1.5 text-[11px] font-bold tracking-[0.14em] text-acid">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-acid" />
            معدات قتالية من بُعد آخر
          </span>

          <h1 className="mt-6 font-display text-[2.7rem] font-black leading-[1.06] tracking-tight sm:text-6xl lg:text-[4.3rem]">
            قوّةٌ من
            <span className="relative mt-1 block">
              <span className="text-gradient-acid text-glow">عالمٍ آخر.</span>
              <svg
                viewBox="0 0 320 14"
                className="mt-3 h-3 w-56 text-acid/70"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 9c48-7 96-7 144-3s102 5 172-2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-[15px] leading-8 text-white/55 sm:text-base">
            الغريب بوابةٌ لمعدات القتال من بُعد آخر. قفازات وواقيات و أدوات
            للكيك بوكس، البوكس، الكونغ فو، والإم إم إيه — مصمّمة لتصمد حيث
            يستسلم الآخرون.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-acid px-7 py-4 text-sm font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-[#d8ff5e]"
            >
              تسوّق الآن
              <ArrowLeft
                size={17}
                className="transition-transform group-hover:-translate-x-1"
              />
            </Link>
            <Link
              href="#arts"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-7 py-4 text-sm font-bold text-white/80 backdrop-blur transition-colors hover:border-acid/40 hover:text-acid"
            >
              اكتشف الفنون الأربعة
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                  {stat.value}
                </span>
                <span className="text-[11px] text-white/40">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 hidden flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-white/35 sm:flex">
            {trust.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <Icon size={13} className="text-acid/70" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative h-[380px] w-full sm:h-[480px] lg:h-[620px]">
          <div className="absolute inset-8 rounded-full bg-violet/10 blur-[100px]" />
          <div className="absolute inset-0">
            <Scene3DClient variant="hero" color="#ff3d6e" accent="#0b0b18" />
          </div>

          <div className="pointer-events-none absolute left-0 top-8 hidden rounded-2xl border border-white/10 bg-ink/60 px-4 py-3 backdrop-blur-md sm:block">
            <p className="text-[9px] tracking-[0.24em] text-white/35">MODEL</p>
            <p className="mt-1 text-xs font-bold text-white">NOVA X-01</p>
            <p className="mt-0.5 text-[10px] text-acid">ZERO-G EDITION</p>
          </div>

          <div className="pointer-events-none absolute bottom-10 right-0 hidden rounded-2xl border border-white/10 bg-ink/60 px-4 py-3 text-left backdrop-blur-md sm:block">
            <p className="text-[9px] tracking-[0.24em] text-white/35">SPEC</p>
            <p className="mt-1 text-xs font-bold text-white">16 OZ</p>
            <p className="mt-0.5 text-[10px] text-white/45">جلد طبيعي</p>
          </div>

          <span className="pointer-events-none absolute bottom-14 left-2 hidden text-[9px] tracking-[0.5em] text-white/25 [writing-mode:vertical-rl] lg:block">
            ZERO GRAVITY ARENA
          </span>
        </div>
      </div>

      <a
        href="#arts"
        aria-label="انتقل إلى الأقسام"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/30 transition-colors hover:text-acid sm:flex"
      >
        <span className="text-[9px] tracking-[0.3em]">SCROLL</span>
        <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15">
          <ChevronDown size={15} className="animate-bounce" />
        </span>
      </a>
    </section>
  );
}
