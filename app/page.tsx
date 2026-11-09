import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Quote,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { ProductCard } from "@/components/site/ProductCard";
import { Configurator } from "@/components/site/Configurator";
import { Reveal } from "@/components/site/Reveal";
import { featuredProducts } from "@/lib/products";

const features = [
  {
    icon: ShieldCheck,
    title: "مواد من بُعد آخر",
    text: "جلود طبيعية وحشوات متعددة الطبقات وتقنيات امتصاص صدمات مخصّصة لكل فن قتالي.",
  },
  {
    icon: Truck,
    title: "توصيل خلال 48 ساعة",
    text: "شحن سريع لجميع المدن، ومجانًا للطلبات التي تتجاوز 700 ر.س.",
  },
  {
    icon: RotateCcw,
    title: "استبدال بلا أسئلة",
    text: "ثلاثون يومًا لتجربة العتاد في التدريب، وإرجاع سهل إن لم يناسبك.",
  },
  {
    icon: Sparkles,
    title: "إصدارات محدودة",
    text: "تصاميم نيون وكروم تُنتج بكميات محدودة، ولا تعود مرة أخرى.",
  },
];

const stats = [
  { value: "240+", label: "منتج في المتجر" },
  { value: "18k", label: "مقاتل في الدائرة" },
  { value: "4", label: "فنون قتالية" },
  { value: "4.9", label: "تقييم المتجر" },
];

const testimonials = [
  {
    name: "ريم الحربي",
    role: "ملاكمة — 3 سنوات",
    quote:
      "قفاز نوفا غيّر إحساسي باللكمة تمامًا. التثبيت حول المعصم يجعلني ألكم بثقة من الجولة الأولى حتى الأخيرة.",
    initials: "ر",
  },
  {
    name: "فارس العتيبي",
    role: "مدرب إم إم إيه",
    quote:
      "أجهّز فريقي بالكامل من الغريب. الجودة ثابتة، والأسعار منطقية، والوصول كان أسرع مما توقعت.",
    initials: "ف",
  },
  {
    name: "نور الدين",
    role: "لاعب ووشو",
    quote:
      "عصا دراغون متوازنة بشكل مثالي. الفرق واضح في الأشكال السريعة، والخشب يتحمل تدريبًا يوميًا.",
    initials: "ن",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      <Marquee
        items={[
          "KICKBOXING",
          "BOXING",
          "KUNG FU",
          "MMA",
          "ZERO GRAVITY",
          "الغريب",
        ]}
      />

      <section id="arts" className="relative py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="FOUR ARTS — ONE PORTAL"
              title={
                <>
                  أربعة فنون، <span className="text-gradient-acid">عتاد واحد</span>
                </>
              }
              description="كل فن له إيقاعه وقوانينه. اختر بوابتك، وستجد عتادًا صُمم خصيصًا لطريقة قتالك."
              action={
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-xs font-bold text-white/70 transition-colors hover:border-acid/50 hover:text-acid"
                >
                  استعرض المتجر كاملًا
                  <ArrowLeft size={14} />
                </Link>
              }
            />
          </Reveal>

          <Reveal className="mt-10" delay={0.05}>
            <CategoryGrid />
          </Reveal>
        </div>
      </section>

      <section className="relative py-10">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="HERO GEAR"
              title={
                <>
                  الأكثر طلبًا من <span className="text-gradient-acid">الغريب</span>
                </>
              }
              description="قطع اختارها المقاتلون في الحلبة وأثبتت نفسها في التدريب. محدودة، متينة، وجاهزة للشحن."
              action={
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-5 py-3 text-xs font-bold text-white/75 transition-colors hover:bg-acid hover:text-ink"
                >
                  كل المنتجات
                  <ArrowUpRight size={14} />
                </Link>
              }
            />
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {featuredProducts.map((product, index) => (
              <Reveal key={product.slug} delay={Math.min(index * 0.04, 0.24)}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Configurator />

      <section id="story" className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-1/3 h-72 w-72 rounded-full bg-violet/10 blur-[130px]" />
        </div>
        <div className="container-x relative grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              eyebrow="THE STRANGER"
              title={
                <>
                  الغريب لا يتبع الحلبة…
                  <br />
                  <span className="text-gradient-acid">يصنع بُعدًا لها</span>
                </>
              }
              description="بدأت الحكاية بحقيبة تدريب واحدة، وقفاز لم يجد صاحبه من يناسب يده تمامًا. فقرّرنا ألا نصنع عتادًا عاديًا، بل بوابةً يمرّ منها المقاتل إلى نسخة أقوى من نفسه."
            />
            <p className="mt-6 max-w-lg text-sm leading-7 text-white/45">
              كل قطعة في الغريب تُختبر في ثلاث جولات: جولة ثبات، جولة صدمات، وجولة
              زمن. ما ينجح فقط يعبر البوابة إلى متجرنا.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-acid px-6 py-3.5 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5"
              >
                ادخل المتجر
                <ArrowLeft size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-bold text-white/75 transition-colors hover:border-acid/40 hover:text-acid"
              >
                تحدّث إلى فريقنا
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative mx-auto aspect-square w-full max-w-lg">
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-5 rounded-full border border-dashed border-acid/25 animate-spin-slow" />
              <div className="absolute inset-12 rounded-full border border-violet/20" />
              <div
                className="absolute inset-16 rounded-full blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, rgba(200,255,46,0.28), rgba(139,92,246,0.18) 45%, transparent 70%)",
                }}
              />
              <div className="absolute inset-0 grid place-items-center">
                <span className="text-gradient-acid font-display text-[9rem] font-black leading-none sm:text-[11rem]">
                  غ
                </span>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-ink/70 px-4 py-2 text-[10px] tracking-[0.3em] text-white/40 backdrop-blur">
                GHAREEB — EST. 2026
              </div>
              <span className="absolute -right-2 top-10 rounded-full border border-white/10 bg-ink/70 px-3 py-2 text-[9px] tracking-[0.2em] text-acid backdrop-blur">
                ZERO GRAVITY
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="why" className="relative py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="WHY GHAREEB"
              title={
                <>
                  لماذا يعبر المقاتلون <span className="text-gradient-acid">هذه البوابة؟</span>
                </>
              }
            />
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 0.06}>
                <div className="group h-full rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition-colors hover:border-acid/30 hover:bg-white/[0.04]">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-acid/20 bg-acid/[0.07] text-acid">
                    <feature.icon size={20} />
                  </span>
                  <h3 className="mt-5 text-base font-extrabold">{feature.title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-white/45">
                    {feature.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 grid grid-cols-2 gap-8 rounded-3xl border border-white/10 bg-ink-2/50 px-6 py-10 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-black text-white sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-[11px] tracking-[0.14em] text-white/40">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="voices" className="relative py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="FROM THE RING"
              title={
                <>
                  أصوات من <span className="text-gradient-acid">الدائرة</span>
                </>
              }
              description="مقاتلون ومدرّبون جرّبوا العتاد في ظروف حقيقية — هذا ما قالوه."
            />
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <Reveal key={item.name} delay={index * 0.07}>
                <figure className="relative flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                  <Quote size={26} className="text-acid/40" />
                  <blockquote className="mt-4 flex-1 text-sm leading-7 text-white/65">
                    {item.quote}
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-white/[0.07] pt-5">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-acid to-violet font-display text-sm font-black text-ink">
                      {item.initials}
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{item.name}</span>
                      <span className="mt-0.5 block text-[11px] text-white/40">
                        {item.role}
                      </span>
                    </span>
                    <span className="ms-auto flex items-center gap-0.5 text-acid">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star key={starIndex} size={11} className="fill-acid" />
                      ))}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-[40px] border border-acid/20 bg-[linear-gradient(135deg,#12122a,#0a0a16_55%,#101024)] px-6 py-16 text-center sm:px-16">
              <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
              <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[30rem] -translate-x-1/2 rounded-full bg-acid/15 blur-[100px]" />
              <div className="pointer-events-none absolute -bottom-24 right-10 h-56 w-56 rounded-full bg-violet/20 blur-[100px]" />

              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-[10px] font-bold tracking-[0.24em] text-white/55">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-acid" />
                  GATE IS OPEN
                </span>
                <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-black leading-tight sm:text-5xl">
                  جاهز لتدخل <span className="text-gradient-acid">البوابة؟</span>
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/50">
                  اختر عتادك، جهّز يديك، ودع الباقي على الغريب. شحن سريع، جودة
                  مختبرة، وتصاميم لا تجدها في هذا العالم.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-acid px-8 py-4 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5"
                  >
                    ابدأ التسوّق
                    <ArrowLeft size={16} />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-bold text-white/80 transition-colors hover:border-white/40 hover:text-white"
                  >
                    تحتاج مساعدة؟
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
