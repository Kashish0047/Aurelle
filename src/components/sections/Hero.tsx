"use client";

import { useRef, type CSSProperties } from "react";
import { contentConfig } from "@/config/content.config";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { getBookingHref, getFirstSectionHref, isSectionEnabled, sectionHref, TOP_ID } from "@/lib/sections";
import { getDefaultWhatsAppLink } from "@/lib/whatsapp";
import { useSiteContent } from "@/lib/content/context";
import { ArrowIcon, ButtonLink } from "@/components/ui/Button";
import { RatingChip } from "@/components/ui/RatingChip";
import { ScrollBadge } from "@/components/ui/ScrollBadge";
import { HeroVisual } from "./HeroVisual";

/** Stagger index for the CSS entrance (see "Intro" in globals.css). */
const order = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Full-viewport hero: masked line-by-line headline, CTAs, rating chip, rotating scroll badge,
 * and the 3D bloom (or image/video variant) behind/beside the text.
 * Entrance is pure CSS timed to the preloader curtain (starts on first paint, no JS wait);
 * GSAP only drives the scroll-out parallax.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const scroll = useRef(0);
  const reducedMotion = useReducedMotion();
  const { ui } = contentConfig;
  const { content, site } = useSiteContent();
  const { hero } = content;

  const bookHref = getBookingHref(getDefaultWhatsAppLink(site), site.sections);
  const servicesHref = isSectionEnabled("services", site.sections) ? sectionHref("services") : getFirstSectionHref(site.sections);

  // Scroll-out: progress feeds the 3D scene; content and visual separate for depth.
  useGSAP(
    () => {
      const range = { trigger: root.current, start: "top top", end: "bottom top" };

      // 0 → 1 while the hero scrolls away; the 3D bloom reads this every frame.
      ScrollTrigger.create({ ...range, onUpdate: (self) => void (scroll.current = self.progress) });
      if (reducedMotion) return;

      // Text drifts up faster than the page and fades, the visual sinks slower (parallax depth).
      gsap.to(".hero-content", { yPercent: -16, opacity: 0.1, ease: "none", scrollTrigger: { ...range, scrub: true } });
      gsap.to(".hero-visual", { yPercent: 14, ease: "none", scrollTrigger: { ...range, scrub: true } });
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  return (
    <section
      ref={root}
      id={TOP_ID}
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden"
    >
      <div className="hero-visual absolute inset-0 -z-10">
        <HeroVisual scroll={scroll} />
      </div>
      {/* Soft wash of the background colour behind the text, for legibility over the 3D scene */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-3/4 bg-linear-to-t from-bg via-bg/75 to-transparent md:h-2/3 md:via-bg/30"
      />

      <div className="hero-content container-site relative pb-10 pt-[calc(var(--nav-height)+3rem)] md:pb-14">
        <RatingChip className="reveal-up mb-7" style={order(0)} />
        <p className="reveal-up eyebrow mb-5" style={order(1)}>
          {hero.eyebrow}
        </p>

        <h1 id="hero-title" className="max-w-[11ch] text-display">
          {hero.headlineLines.map((line, i) => (
            <span key={line} className="mask-line">
              <span className="reveal-line block" style={order(i)}>
                {line}
              </span>
            </span>
          ))}
        </h1>

        <div className="mt-9 flex flex-col gap-8 md:mt-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <p className="reveal-up text-lead text-muted" style={order(2)}>
              {hero.subheading}
            </p>
            <div className="reveal-up mt-7 flex flex-wrap gap-3" style={order(3)}>
              <ButtonLink
                href={bookHref}
                magnetic
                {...(bookHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {hero.primaryCta}
                <ArrowIcon />
              </ButtonLink>
              <ButtonLink href={servicesHref} variant="outline" magnetic>
                {hero.secondaryCta}
              </ButtonLink>
            </div>
          </div>
          <ScrollBadge
            text={hero.scrollBadgeText}
            href={getFirstSectionHref(site.sections)}
            // Accessible name must contain the badge's visible text (WCAG 2.5.3 "label in name").
            label={hero.scrollBadgeText.replace(/[\s·]+$/, "") || ui.scrollDown}
            className="reveal-up hidden md:grid"
            style={order(4)}
          />
        </div>
      </div>
    </section>
  );
}
