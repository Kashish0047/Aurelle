"use client";

import type { PointerEvent } from "react";
import Image from "next/image";
import type { Service } from "@/config/types";
import { cn } from "@/lib/cn";
import { formatDuration, formatPrice } from "@/lib/format";
import { ArrowIcon, Button } from "./Button";

interface Props {
  service: Service;
  categoryLabel: string;
  bookLabel: string;
  popularLabel: string;
  onBook: (service: Service) => void;
  /** Frosted-glass surface, so the 3D bloom glows through the card as it passes behind. */
  glass?: boolean;
  className?: string;
}

/**
 * Service card. Hover (desktop): the photo drifts opposite to the pointer inside its arch
 * (parallax) and a soft accent glow follows the cursor. Both are driven by two CSS variables
 * set on pointer move, so there is no React re-render and no animation library involved.
 */
export function ServiceCard({ service, categoryLabel, bookLabel, popularLabel, onBook, glass, className }: Props) {
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", String((e.clientX - rect.left) / rect.width - 0.5));
    e.currentTarget.style.setProperty("--my", String((e.clientY - rect.top) / rect.height - 0.5));
  };
  const onPointerLeave = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--mx", "0");
    e.currentTarget.style.setProperty("--my", "0");
  };

  return (
    <article
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn(
        "group/card relative flex flex-col overflow-hidden rounded-[1.75rem] border border-line p-3 transition-shadow duration-700 ease-out-expo [--mx:0] [--my:0] hover:shadow-[0_30px_80px_-30px_var(--glow)]",
        glass ? "bg-surface/55 backdrop-blur-2xl backdrop-saturate-150" : "bg-surface",
        className,
      )}
    >
      {/* Cursor-following glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at calc((var(--mx) + 0.5) * 100%) calc((var(--my) + 0.5) * 100%), color-mix(in oklab, var(--glow) 55%, transparent), transparent 60%)",
        }}
      />

      <div className="relative h-[clamp(15rem,40svh,24rem)] overflow-hidden rounded-t-[999px] rounded-b-[1.25rem]">
        <Image
          src={service.image.src}
          alt={service.image.alt}
          fill
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out-expo [transform:translate3d(calc(var(--mx)*-18px),calc(var(--my)*-18px),0)_scale(1.1)] group-hover/card:[transform:translate3d(calc(var(--mx)*-18px),calc(var(--my)*-18px),0)_scale(1.16)]"
        />
        {service.popular && (
          <span className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full bg-surface/85 px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] backdrop-blur">
            {popularLabel}
          </span>
        )}
      </div>

      <div className="relative flex flex-1 flex-col gap-3 px-3 pb-3 pt-5">
        <p className="text-[0.7rem] uppercase tracking-[0.2em] text-muted">
          {categoryLabel} · {formatDuration(service.durationMinutes)}
        </p>
        <h3 className="font-serif text-[1.75rem] leading-[1.05]">{service.name}</h3>
        <p className="text-sm leading-relaxed text-muted">{service.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <p className="font-serif text-2xl">{formatPrice(service.price, service.priceFrom)}</p>
          <Button size="sm" variant="outline" onClick={() => onBook(service)} aria-label={`${bookLabel}: ${service.name}`}>
            {bookLabel}
            <ArrowIcon />
          </Button>
        </div>
      </div>
    </article>
  );
}
