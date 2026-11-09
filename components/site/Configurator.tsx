"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Sparkles, ShoppingBag } from "lucide-react";
import { Scene3DClient } from "@/components/three/Scene3DClient";
import {
  categories,
  categoryMap,
  formatPrice,
  products,
  type CategoryId,
} from "@/lib/products";
import { useCart } from "@/lib/store";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

const finishes = [
  { id: "leather", label: "جلد طبيعي", metalness: 0.15, roughness: 0.42 },
  { id: "chrome", label: "كروم فضائي", metalness: 0.95, roughness: 0.12 },
  { id: "matte", label: "مطفي", metalness: 0.05, roughness: 0.78 },
];

const colors = [
  { hex: "#c8ff2e", label: "حمض" },
  { hex: "#ff3d6e", label: "نيون" },
  { hex: "#22d3ee", label: "سماوي" },
  { hex: "#8b5cf6", label: "بنفسجي" },
  { hex: "#ff7a18", label: "برتقالي" },
  { hex: "#e5e7eb", label: "أبيض" },
];

const accents = ["#0b0b18", "#e5e7eb", "#ff3d6e", "#8b5cf6"];
const gloveSizes = [
  { id: "10", label: "10 OZ", delta: 0 },
  { id: "12", label: "12 OZ", delta: 20 },
  { id: "14", label: "14 OZ", delta: 40 },
  { id: "16", label: "16 OZ", delta: 60 },
];
const staffSizes = [
  { id: "160", label: "160 سم", delta: 0 },
  { id: "175", label: "175 سم", delta: 20 },
  { id: "190", label: "190 سم", delta: 40 },
];

const sizesBySport: Record<CategoryId, typeof gloveSizes> = {
  boxing: gloveSizes,
  kickboxing: gloveSizes,
  mma: gloveSizes,
  kungfu: staffSizes,
};

export function Configurator() {
  const [sport, setSport] = useState<CategoryId>("boxing");
  const [color, setColor] = useState("#ff3d6e");
  const [accent, setAccent] = useState("#0b0b18");
  const [finishId, setFinishId] = useState("leather");
  const [size, setSize] = useState("12");
  const [added, setAdded] = useState(false);

  const add = useCart((state) => state.add);
  const category = categoryMap[sport];
  const baseProduct = products.find((product) => product.category === sport);
  const finish = finishes.find((item) => item.id === finishId) ?? finishes[0];
  const sizeList = sizesBySport[sport];
  const sizeOption = sizeList.find((item) => item.id === size) ?? sizeList[0];
  const price = (baseProduct?.price ?? 0) + sizeOption.delta;

  function chooseSport(next: CategoryId) {
    setSport(next);
    setColor(categoryMap[next].color);
    setSize(sizesBySport[next][0].id);
  }

  function handleAdd() {
    if (!baseProduct) return;
    add(baseProduct.slug);
    setAdded(true);
    setTimeout(() => setAdded(false), 2400);
  }

  return (
    <section id="lab" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-violet/10 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-acid/[0.06] blur-[120px]" />
      </div>

      <div className="container-x relative">
        <SectionHeading
          eyebrow="GHAREEB LAB"
          title={
            <>
              اصنع عتادك <span className="text-gradient-acid">في البُعد الآخر</span>
            </>
          }
          description="مخبر تصميم تفاعلي: اختر الفن، اللون، التشطيب والمقاس، وشاهد عتادك يتشكّل مباشرة أمامك بثلاثة أبعاد."
          action={
            <Link
              href={`/shop?category=${sport}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-xs font-bold text-white/70 transition-colors hover:border-acid/50 hover:text-acid"
            >
              كل منتجات {category.name}
              <ArrowLeft size={14} />
            </Link>
          }
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-ink-2/60">
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 text-[10px] font-semibold tracking-[0.24em] text-white/35">
              <span>GHAREEB LAB — 3D</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-acid" />
                LIVE
              </span>
            </div>

            <div className="h-[400px] sm:h-[480px]">
              <Scene3DClient
                variant="config"
                model={sport === "kungfu" ? "staff" : "glove"}
                color={color}
                accent={accent}
                metalness={finish.metalness}
                roughness={finish.roughness}
              />
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
              <div className="rounded-2xl border border-white/10 bg-ink/75 px-4 py-3 backdrop-blur">
                <p className="text-[9px] tracking-[0.24em] text-white/40">CONFIG</p>
                <p className="mt-1 text-sm font-bold">
                  {category.name} / {sizeOption.label}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-ink/75 px-4 py-3 text-left backdrop-blur">
                <p className="text-[9px] tracking-[0.24em] text-white/40">PRICE</p>
                <p className="mt-1 text-sm font-extrabold text-acid">
                  {formatPrice(price)} ر.س
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.025] p-6 sm:p-8">
            <div>
              <p className="text-[11px] font-bold tracking-[0.24em] text-white/40">
                ١ — الفن
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {categories.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseSport(item.id)}
                    className={cn(
                      "rounded-2xl border px-2 py-3 text-xs font-bold transition-all",
                      sport === item.id
                        ? "border-transparent text-ink"
                        : "border-white/12 text-white/60 hover:border-white/30 hover:text-white",
                    )}
                    style={
                      sport === item.id ? { backgroundColor: item.color } : undefined
                    }
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <p className="text-[11px] font-bold tracking-[0.24em] text-white/40">
                ٢ — اللون
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {colors.map((item) => (
                  <button
                    key={item.hex}
                    type="button"
                    onClick={() => setColor(item.hex)}
                    aria-label={item.label}
                    aria-pressed={color === item.hex}
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-full border-2 transition-transform hover:scale-110",
                      color === item.hex ? "border-white" : "border-white/15",
                    )}
                    style={{ backgroundColor: item.hex }}
                  >
                    {color === item.hex ? (
                      <Check size={15} className="text-ink" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <p className="text-[11px] font-bold tracking-[0.24em] text-white/40">
                ٣ — التشطيب
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {finishes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFinishId(item.id)}
                    className={cn(
                      "rounded-xl border px-2 py-2.5 text-[11px] font-bold transition-colors",
                      finishId === item.id
                        ? "border-acid/70 bg-acid/10 text-acid"
                        : "border-white/12 text-white/55 hover:border-white/30 hover:text-white",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <p className="text-[11px] font-bold tracking-[0.24em] text-white/40">
                ٤ — لون الحواف
              </p>
              <div className="mt-3 flex items-center gap-3">
                {accents.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAccent(item)}
                    aria-label={`لون الحواف ${item}`}
                    aria-pressed={accent === item}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                      accent === item ? "border-acid" : "border-white/15",
                    )}
                    style={{ backgroundColor: item }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-7">
              <p className="text-[11px] font-bold tracking-[0.24em] text-white/40">
                ٥ — {sport === "kungfu" ? "الطول" : "الوزن"}
              </p>
              <div className="mt-3 flex gap-2">
                {sizeList.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSize(item.id)}
                    className={cn(
                      "flex-1 rounded-xl border py-2.5 text-[11px] font-bold transition-colors",
                      size === item.id
                        ? "border-white bg-white text-ink"
                        : "border-white/12 text-white/55 hover:border-white/30 hover:text-white",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-acid px-5 py-4 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5"
              >
                {added ? <Check size={17} /> : <ShoppingBag size={17} />}
                {added ? "أُضيف إلى السلة" : "أضف التصميم إلى السلة"}
              </button>
              <span className="flex items-center justify-center gap-1.5 text-[11px] text-white/35">
                <Sparkles size={13} className="text-acid" />
                معاينة تفاعلية
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
