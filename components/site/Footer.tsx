import Link from "next/link";
import { ArrowUpRight, Instagram, MessageCircle, Youtube } from "lucide-react";
import { Logo } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";
import { categories } from "@/lib/products";

const company = [
  { href: "/#story", label: "قصة الغريب" },
  { href: "/#why", label: "لماذا نحن" },
  { href: "/#voices", label: "آراء المقاتلين" },
  { href: "/contact", label: "تواصل معنا" },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-ink-2/60">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-violet/10 blur-[120px]" />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/50">
            الغريب ليس متجرًا عاديًا. إنه بوابة لمعدات قتال مصمّمة كأنها هبطت من بُعد
            آخر — للكيك بوكس، البوكس، الكونغ فو، والإم إم إيه.
          </p>
          <div className="mt-6 flex items-center gap-3">
            {[
              { Icon: Instagram, label: "إنستغرام" },
              { Icon: Youtube, label: "يوتيوب" },
              { Icon: MessageCircle, label: "واتساب" },
            ].map(({ Icon, label }) => (
              <span
                key={label}
                title={label}
                aria-hidden="true"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/12 text-white/60"
              >
                <Icon size={17} />
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-extrabold text-white">تسوّق</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href="/shop" className="text-white/50 transition-colors hover:text-acid">
                كل المنتجات
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/shop?category=${category.id}`}
                  className="text-white/50 transition-colors hover:text-acid"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-extrabold text-white">الغريب</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {company.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group inline-flex items-center gap-1 text-white/50 transition-colors hover:text-acid"
                >
                  {item.label}
                  <ArrowUpRight
                    size={12}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h3 className="text-sm font-extrabold text-white">نشرة البُعد الآخر</h3>
          <p className="mt-3 text-sm leading-6 text-white/45">
            أول من يعرف بالإصدارات المحدودة والتخفيضات التي لا تتكرر.
          </p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="container-x relative flex flex-col items-center justify-between gap-5 border-t border-white/[0.07] py-6 text-xs text-white/35 md:flex-row">
        <p>© {new Date().getFullYear()} الغريب — كل الحقوق محفوظة. صُنع في بُعد آخر.</p>
        <div className="flex items-center gap-2">
          {["مدى", "VISA", "Mastercard", "Apple Pay"].map((method) => (
            <span
              key={method}
              className="rounded-md border border-white/10 px-2 py-1 text-[10px] text-white/45"
            >
              {method}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
