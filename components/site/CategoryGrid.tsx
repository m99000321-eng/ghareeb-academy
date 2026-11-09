import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { categories } from "@/lib/products";
import { categoryIcons } from "./categoryIcons";
import { cn } from "@/lib/utils";

const spans = [
  "md:col-span-7",
  "md:col-span-5",
  "md:col-span-5",
  "md:col-span-7",
];

export function CategoryGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-12">
      {categories.map((category, index) => {
        const Icon = categoryIcons[category.id];
        return (
          <Link
            key={category.id}
            href={`/shop?category=${category.id}`}
            className={cn(
              "group relative min-h-[300px] overflow-hidden rounded-[32px] border border-white/10 bg-ink-2/70 p-7 transition-all duration-500 hover:border-white/25 md:min-h-[340px]",
              spans[index],
            )}
          >
            <span
              className="absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background: `radial-gradient(120% 130% at 95% 0%, ${category.colorSoft}, transparent 62%)`,
              }}
            />
            <span className="bg-grid absolute inset-0 opacity-20" />
            <span
              className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
              style={{ background: category.color }}
            />

            <div className="relative flex h-full flex-col justify-between gap-12">
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs text-white/35">{category.index}</span>
                <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                  {category.nameEn}
                </span>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <h3 className="font-display text-3xl font-extrabold sm:text-4xl">
                    {category.name}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-white/50">
                    {category.description}
                  </p>
                  <span
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold transition-transform duration-300 group-hover:-translate-x-1"
                    style={{ color: category.color }}
                  >
                    تسوّق {category.name}
                    <ArrowLeft size={16} />
                  </span>
                </div>
                <Icon
                  size={116}
                  strokeWidth={0.7}
                  className="shrink-0 opacity-25 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110"
                  style={{ color: category.color }}
                />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
