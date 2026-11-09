import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="الغريب — الصفحة الرئيسية"
      className={cn("group flex items-center gap-3", className)}
    >
      <span className="relative grid h-12 w-12 shrink-0 place-items-center">
        <span className="absolute inset-0 rotate-45 rounded-[15px] border border-gold/35 transition-transform duration-700 group-hover:rotate-[135deg]" />
        <Image
          src="/brand/logo.png"
          alt="شعار الغريب"
          width={96}
          height={96}
          priority
          className="relative h-11 w-11 rounded-full object-cover ring-1 ring-gold/50"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-extrabold tracking-tight text-white">
          الغريب
        </span>
        <span className="mt-1 text-[9px] font-semibold tracking-[0.36em] text-gold/75">
          AL-GHAREEB
        </span>
      </span>
    </Link>
  );
}
