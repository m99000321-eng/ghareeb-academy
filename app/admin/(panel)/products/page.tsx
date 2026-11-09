import Link from "next/link";
import { Boxes, PackageSearch, Search } from "lucide-react";
import { getAdminCatalog } from "@/lib/catalog";
import { categories } from "@/lib/products";
import { ProductRowForm } from "@/components/admin/ProductRowForm";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";
  const category =
    typeof params.category === "string" &&
    categories.some((item) => item.id === params.category)
      ? params.category
      : "";

  const catalog = await getAdminCatalog();
  const filtered = catalog.filter((product) => {
    if (category && product.category !== category) return false;
    if (!query) return true;
    return [product.name, product.nameEn, product.sku, product.slug]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const lowStock = catalog.filter((product) => product.stock <= 5).length;
  const hidden = catalog.filter((product) => product.active === false).length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.3em] text-acid">
            INVENTORY
          </p>
          <h1 className="mt-2 font-display text-3xl font-black">
            المنتجات والمخزون
          </h1>
          <p className="mt-2 text-xs text-white/40">
            {catalog.length} منتج — {lowStock} مخزون منخفض — {hidden} مخفي
          </p>
        </div>
        <form
          action="/admin/products"
          method="get"
          className="relative w-full sm:w-72"
        >
          {category ? (
            <input type="hidden" name="category" value={category} />
          ) : null}
          <Search
            size={15}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            name="q"
            defaultValue={query}
            placeholder="ابحث بالاسم أو SKU…"
            className="h-11 w-full rounded-full border border-white/12 bg-white/[0.03] pe-4 ps-10 text-[11px] text-white outline-none placeholder:text-white/25 focus:border-acid/50"
          />
        </form>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={query ? `/admin/products?q=${encodeURIComponent(query)}` : "/admin/products"}
          className={cn(
            "rounded-full border px-3.5 py-2 text-[10px] font-bold",
            !category
              ? "border-white bg-white text-ink"
              : "border-white/12 text-white/50 hover:border-white/30",
          )}
        >
          كل الفئات
        </Link>
        {categories.map((item) => {
          const search = new URLSearchParams();
          search.set("category", item.id);
          if (query) search.set("q", query);
          return (
            <Link
              key={item.id}
              href={`/admin/products?${search.toString()}`}
              className="rounded-full border px-3.5 py-2 text-[10px] font-bold"
              style={
                category === item.id
                  ? {
                      backgroundColor: item.color,
                      borderColor: item.color,
                      color: "#05050b",
                    }
                  : {
                      borderColor: "rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.5)",
                    }
              }
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/35">
          <Boxes size={14} className="text-gold" />
          عدّل السعر أو المخزون أو حالة العرض مباشرة — التغييرات تنعكس على المتجر
          فورًا.
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-white/15 py-16 text-center">
          <PackageSearch size={26} className="text-white/25" />
          <p className="mt-3 text-sm font-bold text-white/60">لا منتجات مطابقة</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <ProductRowForm key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
