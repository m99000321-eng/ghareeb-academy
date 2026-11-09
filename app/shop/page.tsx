import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import {
  categories,
  categoryMap,
  queryProducts,
  type SortId,
} from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "المتجر — كل معدات القتال",
  description:
    "تسوّق قفازات وأدوات الكيك بوكس، البوكس، الكونغ فو، والإم إم إيه من الغريب.",
};

const sortOptions: Array<{ id: SortId; label: string }> = [
  { id: "featured", label: "المميزة" },
  { id: "price-asc", label: "الأقل سعرًا" },
  { id: "price-desc", label: "الأعلى سعرًا" },
  { id: "rating", label: "الأعلى تقييمًا" },
];

type ShopSearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function buildHref(params: {
  category?: string;
  q?: string;
  sort?: string;
}): string {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.q) search.set("q", params.q);
  if (params.sort && params.sort !== "featured") search.set("sort", params.sort);
  const query = search.toString();
  return query ? `/shop?${query}` : "/shop";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: ShopSearchParams;
}) {
  const params = await searchParams;
  const categoryParam = first(params.category);
  const query = first(params.q)?.trim() ?? "";
  const sortParam = first(params.sort) ?? "featured";
  const activeCategory =
    categoryParam && categoryMap[categoryParam as keyof typeof categoryMap]
      ? categoryParam
      : undefined;
  const sort = sortOptions.some((option) => option.id === sortParam)
    ? sortParam
    : "featured";

  const results = queryProducts({
    category: activeCategory,
    q: query,
    sort,
  });

  const activeCategoryData = activeCategory
    ? categoryMap[activeCategory as keyof typeof categoryMap]
    : undefined;

  return (
    <div className="relative overflow-hidden pb-16 pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-x-0 top-0 h-[28rem]"
          style={{
            background:
              "radial-gradient(90% 100% at 50% 0%, rgba(139,92,246,0.16), transparent 70%)",
          }}
        />
        <div className="bg-grid absolute inset-0 opacity-[0.12]" />
      </div>

      <div className="container-x relative">
        <nav className="flex items-center gap-2 text-[11px] text-white/35">
          <Link href="/" className="transition-colors hover:text-acid">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-white/60">المتجر</span>
          {activeCategoryData ? (
            <>
              <span>/</span>
              <span style={{ color: activeCategoryData.color }}>
                {activeCategoryData.name}
              </span>
            </>
          ) : null}
        </nav>

        <div className="mt-6 max-w-2xl">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.28em] text-acid">
            <span className="h-px w-8 bg-acid/60" />
            GHAREEB ARMORY
          </span>
          <h1 className="mt-4 font-display text-4xl font-black leading-tight sm:text-5xl">
            {activeCategoryData ? (
              <>
                عتاد <span style={{ color: activeCategoryData.color }}>{activeCategoryData.name}</span>
              </>
            ) : (
              <>
                كل ما تحتاجه <span className="text-gradient-acid">للدخول إلى الحلبة</span>
              </>
            )}
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/50">
            {activeCategoryData
              ? activeCategoryData.description
              : "قفازات، واقيات، أدوات تدريب، وأكثر — مصنّفة حسب الفن القتالي وجاهزة للشحن خلال 48 ساعة."}
          </p>
        </div>

        <div className="mt-9 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.025] p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <form action="/shop" method="get" className="relative w-full md:max-w-sm">
            {activeCategory ? (
              <input type="hidden" name="category" value={activeCategory} />
            ) : null}
            {sort !== "featured" ? (
              <input type="hidden" name="sort" value={sort} />
            ) : null}
            <Search
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/35"
            />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="ابحث عن قفاز، خوذة، عصا…"
              aria-label="بحث في المتجر"
              className="h-12 w-full rounded-full border border-white/12 bg-ink/60 pe-4 ps-11 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-acid/50"
            />
          </form>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="flex shrink-0 items-center gap-1.5 pe-1 text-[11px] text-white/30">
              <SlidersHorizontal size={13} />
              ترتيب
            </span>
            {sortOptions.map((option) => (
              <Link
                key={option.id}
                href={buildHref({
                  category: activeCategory,
                  q: query,
                  sort: option.id,
                })}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-bold transition-colors",
                  sort === option.id
                    ? "border-acid bg-acid text-ink"
                    : "border-white/12 text-white/55 hover:border-white/30 hover:text-white",
                )}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href={buildHref({ q: query, sort })}
            className={cn(
              "rounded-full border px-4 py-2 text-[11px] font-bold transition-colors",
              !activeCategory
                ? "border-white bg-white text-ink"
                : "border-white/12 text-white/55 hover:border-white/30 hover:text-white",
            )}
          >
            كل الفنون
          </Link>
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <Link
                key={category.id}
                href={buildHref({ category: category.id, q: query, sort })}
                className="rounded-full border px-4 py-2 text-[11px] font-bold transition-all"
                style={
                  isActive
                    ? { backgroundColor: category.color, borderColor: category.color, color: "#05050b" }
                    : { borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }
                }
              >
                {category.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            <span className="font-bold text-white">{results.length}</span> منتج
            {query ? (
              <>
                {" "}
                — نتائج البحث عن «<span className="text-white/70">{query}</span>»
              </>
            ) : null}
          </p>
          {(query || activeCategory) && (
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/45 transition-colors hover:text-acid"
            >
              <X size={13} />
              مسح الفلاتر
            </Link>
          )}
        </div>

        {results.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {results.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-white/15 py-20 text-center">
            <Sparkles size={28} className="text-acid/60" />
            <h2 className="mt-4 font-display text-xl font-bold">لا شيء في هذا البُعد بعد</h2>
            <p className="mt-2 max-w-sm text-sm text-white/40">
              لم نجد نتائج مطابقة. جرّب بحثًا آخر أو استعرض كل المنتجات.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-acid px-5 py-3 text-xs font-extrabold text-ink"
            >
              كل المنتجات
              <ArrowLeft size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
