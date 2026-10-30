import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

interface Props {
  text: string;
  href: string;
  label: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Circular "scroll to explore" badge: text set on a circular path that slowly spins
 * (CSS only, stopped by reduced motion), with an arrow in the centre. Links to the next section.
 */
export function ScrollBadge({ text, href, label, className, style }: Props) {
  return (
    <a
      href={href}
      aria-label={label}
      style={style}
      className={cn("group relative grid size-28 place-items-center rounded-full md:size-32", className)}
    >
      <svg viewBox="0 0 120 120" aria-hidden className="absolute inset-0 animate-[spin-slow_18s_linear_infinite]">
        <defs>
          <path id="scroll-badge-circle" d="M60 60 m-48 0 a48 48 0 1 1 96 0 a48 48 0 1 1 -96 0" />
        </defs>
        {/* textLength = path circumference, so any text length wraps the circle exactly once */}
        <text className="fill-ink text-[9px] uppercase">
          <textPath href="#scroll-badge-circle" textLength={301} lengthAdjust="spacingAndGlyphs">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="grid size-11 place-items-center rounded-full bg-ink text-bg transition-transform duration-500 ease-out-expo group-hover:scale-110">
        <svg viewBox="0 0 16 16" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2v12M3 9l5 5 5-5" />
        </svg>
      </span>
    </a>
  );
}
