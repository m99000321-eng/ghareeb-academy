export function Marquee({ items }: { items: string[] }) {
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-ink-2/50 py-4">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {items.map((item, index) => (
              <span key={`${copy}-${index}`} className="flex items-center gap-6 px-6">
                <span className="font-display text-xl font-extrabold uppercase tracking-tight text-white/20 sm:text-2xl">
                  {item}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-acid/70" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
