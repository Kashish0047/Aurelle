import type { CSSProperties } from "react";
import { contentConfig } from "@/config/content.config";
import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/cn";

/** "★★★★★ 4.9 · 1,280 Google reviews" pill. Renders nothing when `siteConfig.rating` is null. */
export function RatingChip({ className, style }: { className?: string; style?: CSSProperties }) {
  const rating = siteConfig.rating;
  if (!rating) return null;
  const count = new Intl.NumberFormat(siteConfig.locale).format(rating.count);
  const label = `${rating.value} · ${count} ${rating.source} ${contentConfig.ui.reviews}`;

  const content = (
    <>
      <span aria-hidden className="flex gap-0.5 text-gold">
        {Array.from({ length: 5 }, (_, i) => (
          <svg key={i} viewBox="0 0 12 12" className="size-3" fill="currentColor">
            <path d="m6 .8 1.6 3.3 3.6.5-2.6 2.5.6 3.6L6 9l-3.2 1.7.6-3.6L.8 4.6l3.6-.5Z" />
          </svg>
        ))}
      </span>
      <span>{label}</span>
    </>
  );

  const classes = cn(
    "inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/60 px-4 py-2 text-xs tracking-wide backdrop-blur-md",
    className,
  );

  return rating.url ? (
    <a href={rating.url} target="_blank" rel="noopener noreferrer" style={style} className={cn(classes, "transition-colors hover:border-ink/40")}>
      {content}
    </a>
  ) : (
    <p className={classes} style={style}>
      {content}
    </p>
  );
}
