import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Check,
  Move3d,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import {
  categoryMap,
  formatPrice,
  getProduct,
  getProductModel,
  getRelated,
  products,
} from "@/lib/products";
import { Scene3DClient } from "@/components/three/Scene3DClient";
import { AddToCart } from "@/components/site/AddToCart";
import { ProductCard } from "@/components/site/ProductCard";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "المنتج غير موجود" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | الغريب`,
      description: product.description,
      type: "website",
    },
  };
}

const guarantees = [
  { icon: Truck, title: "شحن سريع", text: "خلال 48 ساعة" },
  { icon: ShieldCheck, title: "منتج أصلي", text: "ضمان 100%" },
  { icon: RotateCcw, title: "إرجاع سهل", text: "خلال 30 يومًا" },
];

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  const category = categoryMap[product.category];
  const related = getRelated(product);
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: "الغريب | GHAREEB" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "SAR",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="relative overflow-hidden pb-20 pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-x-0 top-0 h-[32rem]"
          style={{
            background: `radial-gradient(80% 100% at 50% 0%, ${category.colorSoft}, transparent 70%)`,
          }}
        />
        <div className="bg-grid absolute inset-0 opacity-[0.1]" />
      </div>

      <div className="container-x relative">
        <nav className="flex flex-wrap items-center gap-2 text-[11px] text-white/35">
          <Link href="/" className="transition-colors hover:text-acid">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/shop" className="transition-colors hover:text-acid">
            المتجر
          </Link>
          <span>/</span>
          <Link
            href={`/shop?category=${category.id}`}
            className="transition-colors hover:text-acid"
            style={{ color: category.color }}
          >
            {category.name}
          </Link>
          <span>/</span>
          <span className="max-w-[12rem] truncate text-white/60">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-ink-2/60">
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4 text-[10px] font-semibold tracking-[0.2em] text-white/40">
                <span>{product.sku}</span>
                <span className="flex items-center gap-1.5">
                  <Move3d size={13} />
                  اسحب للدوران
                </span>
              </div>

              <div className="h-[420px] sm:h-[540px]">
                <Scene3DClient
                  variant="product"
                  model={getProductModel(product.slug)}
                  color={product.modelColor}
                  accent={product.modelAccent}
                  metalness={product.category === "kungfu" ? 0.3 : 0.2}
                  roughness={product.category === "kungfu" ? 0.3 : 0.38}
                />
              </div>

              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-2 to-transparent" />
              <div className="absolute bottom-5 left-5 rounded-full border border-white/10 bg-ink/70 px-4 py-2 text-[10px] text-white/55 backdrop-blur">
                معاينة ثلاثية الأبعاد تفاعلية
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {guarantees.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-center"
                >
                  <Icon size={16} className="mx-auto text-acid" />
                  <p className="mt-2 text-[11px] font-bold text-white/80">{title}</p>
                  <p className="mt-0.5 text-[10px] text-white/35">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-[10px] font-bold"
                style={{
                  backgroundColor: category.colorSoft,
                  color: category.color,
                }}
              >
                {category.name}
              </span>
              {product.badge ? (
                <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-bold text-white/70">
                  {product.badge}
                </span>
              ) : null}
              {product.stock <= 20 ? (
                <span className="flex items-center gap-1.5 rounded-full bg-flare/10 px-3 py-1 text-[10px] font-bold text-flare">
                  <span className="h-1 w-1 rounded-full bg-flare" />
                  كمية محدودة
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 font-display text-3xl font-black leading-tight sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-2 text-[11px] tracking-[0.24em] text-white/30">
              {product.nameEn.toUpperCase()}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1 text-acid">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={14}
                    className={
                      index < Math.round(product.rating)
                        ? "fill-acid text-acid"
                        : "text-white/20"
                    }
                  />
                ))}
                <span className="ms-1 text-xs font-bold text-white/70">
                  {product.rating}
                </span>
              </span>
              <span className="text-xs text-white/35">
                {product.reviews} تقييمًا موثّقًا
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-3 border-y border-white/10 py-5">
              <span className="font-display text-4xl font-black text-white">
                {formatPrice(product.price)}
                <span className="ms-1 text-sm font-bold text-white/40">ر.س</span>
              </span>
              {product.oldPrice ? (
                <>
                  <span className="text-sm text-white/30 line-through">
                    {formatPrice(product.oldPrice)} ر.س
                  </span>
                  <span className="rounded-full bg-acid px-2.5 py-1 text-[11px] font-extrabold text-ink">
                    -{discount}%
                  </span>
                </>
              ) : null}
              <span className="ms-auto text-[11px] text-white/35">
                شامل ضريبة القيمة المضافة
              </span>
            </div>

            <p className="mt-6 text-sm leading-7 text-white/55">
              {product.description}
            </p>

            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {product.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-[13px] text-white/60"
                >
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-acid/15 text-acid">
                    <Check size={10} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-3">
              <span className="text-[11px] text-white/35">الألوان:</span>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <span
                    key={color}
                    title={color}
                    className="h-6 w-6 rounded-full border border-white/25"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="ms-auto flex items-center gap-1.5 text-[11px] text-white/40">
                <span className="h-1.5 w-1.5 rounded-full bg-acid" />
                متوفر — {product.stock} قطعة
              </span>
            </div>

            <div className="mt-7">
              <AddToCart product={product} />
            </div>

            <div className="mt-8 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-[12px] text-white/45">
              <p className="flex items-center gap-2">
                <Truck size={14} className="text-acid" />
                التوصيل المتوقع خلال 2–4 أيام عمل لجميع المدن.
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-acid" />
                الدفع عند الاستلام متاح — أو دفع آمن بالبطاقة.
              </p>
            </div>
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-20">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold tracking-[0.28em] text-acid">
                  FROM THE SAME ART
                </span>
                <h2 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
                  يكمل عتادك
                </h2>
              </div>
              <Link
                href={`/shop?category=${category.id}`}
                className="text-xs font-bold text-white/50 transition-colors hover:text-acid"
              >
                كل {category.name}
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-6">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
