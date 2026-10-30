"use client";

import { useRef } from "react";
import { useSiteContent } from "@/lib/content/context";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Giant brand name at the very bottom of the page.
 * Scroll-scrubbed reveal: as the footer enters, the whole word rises from below its mask
 * while individual letters settle at slightly different speeds (staggered parallax),
 * so it feels like the name surfaces from behind the page.
 */
export function FooterWordmark() {
  const { site: siteConfig } = useSiteContent();
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const chars = Array.from(siteConfig.name);

  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.fromTo(
        ".fw-char",
        { yPercent: 70 },
        {
          yPercent: 0,
          ease: "none",
          stagger: { each: 0.06, from: "center" },
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom", // starts when the wordmark peeks in
            end: "bottom bottom", // fully settled when it reaches the bottom edge
            scrub: 0.6, // smoothing so it trails the scroll slightly
          },
        },
      );
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  return (
    <div ref={root} aria-hidden className="overflow-hidden select-none">
      <p className="flex justify-center font-serif text-[clamp(5rem,24vw,24rem)] leading-[0.82] tracking-[-0.04em] text-ink">
        {chars.map((char, i) => (
          <span key={i} className="fw-char inline-block will-change-transform">
            {char === " " ? " " : char}
          </span>
        ))}
      </p>
    </div>
  );
}
