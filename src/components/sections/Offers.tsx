"use client";

import { useRef, useState } from "react";
import { contentConfig } from "@/config/content.config";
import { gsap, useGSAP } from "@/lib/gsap";
import { useCountdown, useHasEnded } from "@/lib/hooks/useCountdown";
import { getBookingHref } from "@/lib/sections";
import { getDefaultWhatsAppLink } from "@/lib/whatsapp";
import { useSiteContent } from "@/lib/content/context";
import { ArrowIcon, ButtonLink } from "@/components/ui/Button";

/**
 * Seasonal offer banner (toggle with `sections.offers`).
 * Scroll: the card starts smaller with very round corners and expands toward full width as
 * it reaches the middle of the screen (scrubbed) — like a curtain opening onto the offer.
 * The live countdown hides the whole banner automatically once `endsAt` has passed.
 */
export function Offers() {
  const root = useRef<HTMLElement>(null);
  const { content, site } = useSiteContent();
  const copy = content.offers;
  const ended = useHasEnded(copy.endsAt);
  const [copied, setCopied] = useState(false);
  const bookHref = copy.ctaHref || getBookingHref(getDefaultWhatsAppLink(site), site.sections);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".offer-card",
          { scale: 0.86, borderRadius: "7rem" },
          {
            scale: 1,
            borderRadius: "2.5rem",
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "center 55%", scrub: 0.6 },
          },
        );
      });
    },
    { scope: root },
  );

  if (ended) return null;

  const copyCode = async () => {
    if (!copy.code) return;
    try {
      await navigator.clipboard.writeText(copy.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the code is still visible to copy by hand */
    }
  };

  return (
    <section ref={root} id="offers" aria-labelledby="offers-title" className="relative bg-bg py-16 md:py-24">
      <div className="container-site">
        <div className="offer-card relative grid gap-12 overflow-hidden rounded-[2.5rem] bg-accent px-6 py-14 text-accent-contrast will-change-transform md:grid-cols-[1.2fr_1fr] md:items-center md:px-16 md:py-20">
          {/* Darker glows only: lighter ones would lower the text contrast on the accent colour. */}
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-ink/25 blur-[100px]" />

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.24em]">{copy.eyebrow}</p>
            <h2 id="offers-title" className="mt-4 text-headline">
              {copy.title}
            </h2>
            <p className="mt-6 max-w-md text-lead">{copy.description}</p>

            {copy.code && (
              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent-contrast/40 py-1.5 pl-5 pr-1.5">
                <span className="font-mono text-sm tracking-[0.2em]">{copy.code}</span>
                <button
                  type="button"
                  onClick={copyCode}
                  className="rounded-full bg-accent-contrast px-4 py-2 text-xs font-medium text-accent transition-opacity hover:opacity-85"
                >
                  <span aria-live="polite">{copied ? copy.copiedLabel : copy.copyLabel}</span>
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.24em]">{copy.endsInLabel}</p>
            <Countdown endsAt={copy.endsAt} units={copy.units} />
            <ButtonLink
              href={bookHref}
              magnetic
              className="mt-8"
              {...(bookHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {copy.ctaLabel}
              <ArrowIcon />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The ticking boxes — the only part of the banner that re-renders every second. */
function Countdown({ endsAt, units }: { endsAt: string; units: typeof contentConfig.offers.units }) {
  const remaining = useCountdown(endsAt);
  const cells = [
    { value: remaining?.days, label: units.days },
    { value: remaining?.hours, label: units.hours },
    { value: remaining?.minutes, label: units.minutes },
    { value: remaining?.seconds, label: units.seconds },
  ];
  return (
    // `contain` keeps each per-second text change from re-laying-out the whole page.
    <div className="mt-4 grid grid-cols-4 gap-2 [contain:layout_paint] md:gap-3" role="timer" aria-live="off">
      {cells.map((u) => (
        <div key={u.label} className="rounded-2xl bg-ink/20 px-2 py-4 text-center [contain:layout_paint]">
          <span className="block font-serif text-[clamp(2rem,1.4rem+2.5vw,3.5rem)] leading-none tabular-nums">
            {u.value === undefined ? "––" : String(u.value).padStart(2, "0")}
          </span>
          <span className="mt-2 block text-[0.65rem] uppercase tracking-[0.18em]">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
