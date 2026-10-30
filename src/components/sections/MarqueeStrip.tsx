"use client";

import { useEffect, useRef } from "react";
import { contentConfig } from "@/config/content.config";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Infinite keyword strip.
 *
 * The drift itself is a CSS animation (`marquee-drift` in globals.css): two identical copies
 * slide left by -50% and loop seamlessly, running on the GPU with no per-frame JavaScript.
 * Scroll velocity only adjusts the animation's playbackRate while the visitor scrolls — faster
 * on quick scrolls (up to ~6×), reversed when scrolling up — then eases back to idle.
 * The animation pauses whenever the strip is off-screen. Static for reduced motion.
 */
export function MarqueeStrip() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { marquee } = contentConfig;
  // Repeat the words so one copy is always wider than ultra-wide screens.
  const words = reducedMotion ? marquee : [...marquee, ...marquee];

  // Pause the CSS animation while off-screen (battery + no wasted compositing).
  useEffect(() => {
    const el = track.current;
    if (reducedMotion || !el) return;
    const io = new IntersectionObserver(([entry]) => {
      el.getAnimations().forEach((a) => (entry?.isIntersecting ? a.play() : a.pause()));
    });
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion]);

  // Scroll velocity → playbackRate (only does work during scrolling).
  useGSAP(
    () => {
      const el = track.current;
      if (reducedMotion || !el) return;
      const rate = { value: 1 };
      const apply = () => el.getAnimations().forEach((a) => a.updatePlaybackRate(rate.value));

      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const boost = Math.min(Math.abs(self.getVelocity()) / 220, 5);
          const direction = self.direction === 1 ? 1 : -1;
          rate.value = direction * (1 + boost);
          apply();
          // Ease back to the idle drift, keeping the current direction.
          gsap.to(rate, { value: direction, duration: 1.2, ease: "power2.out", overwrite: true, onUpdate: apply });
        },
      });
    },
    { scope: root, dependencies: [reducedMotion] },
  );

  const copy = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className={reducedMotion ? "flex flex-wrap items-center justify-center gap-y-4" : "flex shrink-0 items-center"}
    >
      {words.map((word, i) => (
        <li key={i} className="flex items-center">
          <span className="px-6 font-serif text-[clamp(2.25rem,5vw,4.5rem)] italic leading-none md:px-10">{word}</span>
          <svg aria-hidden viewBox="0 0 20 20" className="size-4 shrink-0 text-accent md:size-5" fill="currentColor">
            <path d="M10 0c.6 5.2 4.8 9.4 10 10-5.2.6-9.4 4.8-10 10-.6-5.2-4.8-9.4-10-10C5.2 9.4 9.4 5.2 10 0Z" />
          </svg>
        </li>
      ))}
    </ul>
  );

  return (
    <section ref={root} id="marquee" className="relative overflow-hidden border-y border-line bg-bg py-7 md:py-10">
      <div ref={track} className={reducedMotion ? "container-site" : "marquee-track flex w-max"}>
        {copy(false)}
        {!reducedMotion && copy(true)}
      </div>
    </section>
  );
}
