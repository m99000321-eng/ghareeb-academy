import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-3 text-[11px] font-bold tracking-[0.3em] text-acid">
          <span className="h-px w-8 bg-acid/60" />
          {eyebrow}
        </span>
        <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.15] sm:text-4xl lg:text-[2.9rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
