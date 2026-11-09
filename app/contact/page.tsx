import type { Metadata } from "next";
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Plus,
} from "lucide-react";
import { ContactForm } from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description:
    "تواصل مع فريق الغريب — استفسارات المنتجات، الطلبات، أو التعاون. نرد خلال 24 ساعة.",
};

const channels = [
  {
    icon: Mail,
    label: "البريد الإلكتروني",
    value: "hello@ghareeb.store",
    href: "mailto:hello@ghareeb.store",
  },
  {
    icon: MessageCircle,
    label: "واتساب",
    value: "+966 55 000 0000",
    href: "https://wa.me/966550000000",
  },
  {
    icon: MapPin,
    label: "المقر",
    value: "الرياض — حي النخيل، شارع البوابة",
  },
  {
    icon: Clock,
    label: "ساعات العمل",
    value: "السبت – الخميس، 10 ص – 10 م",
  },
];

const faqs = [
  {
    question: "كيف أختار وزن القفاز المناسب؟",
    answer:
      "للتدريب على الكيس واللياقة: 10–12 أونصة. للسبارينغ والحماية الأكبر: 14–16 أونصة. إن كنت بين مقاسين، اختر الأثقل لحماية أفضل.",
  },
  {
    question: "هل الشحن متاح لكل المدن؟",
    answer:
      "نعم، نشحن إلى جميع مدن المملكة خلال 2–4 أيام عمل. الشحن مجاني للطلبات التي تتجاوز 700 ر.س.",
  },
  {
    question: "هل يمكنني الاستبدال أو الإرجاع؟",
    answer:
      "لديك 30 يومًا من الاستلام لإرجاع المنتج بحالته الأصلية. تواصل معنا وسنرتب عملية الاستلام والاستبدال.",
  },
  {
    question: "هل المنتجات أصلية ومضمونة؟",
    answer:
      "كل منتجات الغريب أصلية وتخضع لفحص جودة من ثلاث جولات قبل الشحن، مع ضمان ضد عيوب التصنيع.",
  },
];

export default function ContactPage() {
  return (
    <div className="relative overflow-hidden pb-20 pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-x-0 top-0 h-[30rem]"
          style={{
            background:
              "radial-gradient(85% 100% at 50% 0%, rgba(200,255,46,0.09), transparent 70%)",
          }}
        />
        <div className="bg-grid absolute inset-0 opacity-[0.1]" />
      </div>

      <div className="container-x relative">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.28em] text-acid">
          <span className="h-px w-8 bg-acid/60" />
          OPEN CHANNEL
        </span>
        <h1 className="mt-4 max-w-2xl font-display text-4xl font-black leading-tight sm:text-5xl">
          تحدّث إلى <span className="text-gradient-acid">الغريب</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/50">
          سؤال عن مقاس؟ طلب خاص؟ أو فكرة تعاون من بُعد آخر؟ فريقنا يقرأ كل رسالة
          بنفسه، ويرد خلال 24 ساعة.
        </p>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {channels.map(({ icon: Icon, label, value, href }) => {
              const content = (
                <>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-acid/20 bg-acid/[0.07] text-acid">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] tracking-[0.18em] text-white/35">
                      {label}
                    </span>
                    <span className="mt-1 block truncate text-sm font-bold text-white/85">
                      {value}
                    </span>
                  </span>
                </>
              );

              return href ? (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.025] p-4 transition-colors hover:border-acid/30 hover:bg-white/[0.04]"
                >
                  {content}
                </a>
              ) : (
                <div
                  key={label}
                  className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.025] p-4"
                >
                  {content}
                </div>
              );
            })}

            <div className="rounded-3xl border border-white/10 bg-ink-2/60 p-5">
              <p className="text-[11px] font-bold tracking-[0.2em] text-white/35">
                GHAREEB HQ
              </p>
              <p className="mt-3 text-sm leading-7 text-white/55">
                نستقبل زيارات المعرض بموعد مسبق. جرّب العتاد، اختبر الوزن،
                واختر ما يناسب يدك قبل الشراء.
              </p>
            </div>
          </div>

          <ContactForm />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
            أسئلة سريعة
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition-colors open:border-acid/25"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-white/85 [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <Plus
                    size={16}
                    className="shrink-0 text-acid transition-transform duration-300 group-open:rotate-45"
                  />
                </summary>
                <p className="mt-3 text-[13px] leading-7 text-white/45">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
