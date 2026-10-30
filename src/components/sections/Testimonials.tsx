"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { contentConfig } from "@/config/content.config";
import { googleReviewsUrl } from "@/config/testimonials.config";
import { useSiteContent } from "@/lib/content/context";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { ArrowIcon } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

const GAP = 24;

/**
 * Draggable testimonial carousel.
 * - Drag/swipe with momentum; on release it snaps to the nearest slide (projected by velocity).
 * - Prev/next buttons, ← → keys when focused, and a slide counter.
 * Scroll: a giant quotation mark drifts and turns behind the slides, and the whole track
 * glides in from the right as the section enters (both scrubbed).
 */
export function Testimonials() {
  const root = useRef<HTMLElement>(null);
  const firstSlide = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const x = useMotionValue(0);
  const reducedMotion = useReducedMotion();
  const { testimonials: copy, ui } = contentConfig;
  const { testimonials } = useSiteContent();
  const last = testimonials.length - 1;

  // Measure one slide (+ gap) so snapping works at every breakpoint.
  useEffect(() => {
    const el = firstSlide.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStep(el.offsetWidth + GAP));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep the current slide aligned after a resize.
  useEffect(() => {
    x.set(-index * step);
    // Only re-align when the slide width changes; index changes animate in goTo().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const goTo = (target: number) => {
    const next = Math.min(last, Math.max(0, target));
    setIndex(next);
    animate(x, -next * step, reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 34 });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") goTo(index + 1);
    if (e.key === "ArrowLeft") goTo(index - 1);
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const range = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true };
        // Decorative quote mark: slow drift + quarter turn across the section.
        gsap.fromTo(".testi-quote", { yPercent: -20, rotate: -12 }, { yPercent: 25, rotate: 8, ease: "none", scrollTrigger: range });
        // Track glides in from the right while the section scrolls into view.
        gsap.fromTo(
          ".testi-drift",
          { xPercent: 14 },
          { xPercent: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 25%", scrub: 0.6 } },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="testimonials" aria-labelledby="testimonials-title" className="section-pad relative overflow-hidden bg-bg">
      <span
        aria-hidden
        className="testi-quote pointer-events-none absolute -bottom-[0.35em] right-[3%] select-none font-serif text-[clamp(14rem,34vw,30rem)] leading-none text-glow/70"
      >
        &ldquo;
      </span>

      <div className="container-site relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading id="testimonials-title" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
        <div className="flex items-center gap-3">
          <span className="mr-2 text-sm tabular-nums tracking-widest text-muted" aria-live="polite">
            {String(index + 1).padStart(2, "0")} / {String(last + 1).padStart(2, "0")}
          </span>
          <ArrowButton label={ui.previous} disabled={index === 0} onClick={() => goTo(index - 1)} flip />
          <ArrowButton label={ui.next} disabled={index === last} onClick={() => goTo(index + 1)} />
        </div>
      </div>

      <div
        className="testi-drift relative mt-14 md:mt-20"
        role="group"
        aria-roledescription="carousel"
        aria-labelledby="testimonials-title"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <motion.div
          className="flex cursor-grab pl-[clamp(1rem,4vw,3.5rem)] active:cursor-grabbing"
          style={{ x, gap: GAP }}
          drag="x"
          dragConstraints={{ left: -last * step, right: 0 }}
          dragElastic={0.12}
          onDragEnd={(_, info) => {
            if (!step) return;
            const projected = x.get() + info.velocity.x * 0.25;
            goTo(Math.round(-projected / step));
          }}
        >
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              ref={i === 0 ? firstSlide : undefined}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${last + 1}`}
              // Inactive slides recede by scale (not opacity) so their text keeps full contrast.
              className={cn(
                "w-[86vw] shrink-0 select-none transition-transform duration-700 ease-out-expo md:w-[62vw] lg:w-[46vw]",
                i === index ? "scale-100" : "scale-[0.94]",
              )}
            >
              <figure className="flex h-full flex-col justify-between gap-10 rounded-[2rem] border border-line bg-surface p-8 md:p-12">
                <div>
                  <div className="flex gap-1 text-gold" role="img" aria-label={`${t.rating} / 5`}>
                    {Array.from({ length: 5 }, (_, s) => (
                      <svg key={s} aria-hidden viewBox="0 0 12 12" className={cn("size-4", s >= t.rating && "opacity-25")} fill="currentColor">
                        <path d="m6 .8 1.6 3.3 3.6.5-2.6 2.5.6 3.6L6 9l-3.2 1.7.6-3.6L.8 4.6l3.6-.5Z" />
                      </svg>
                    ))}
                  </div>
                  <blockquote className="mt-6 font-serif text-[clamp(1.5rem,1.1rem+1.6vw,2.5rem)] leading-[1.2]">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                </div>
                <figcaption className="flex items-center justify-between gap-4 border-t border-line pt-6 text-sm">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-right text-muted">{[t.service, t.location].filter(Boolean).join(" · ")}</span>
                </figcaption>
              </figure>
            </div>
          ))}
        </motion.div>
      </div>

      {googleReviewsUrl && (
        <div className="container-site mt-12">
          <a
            href={googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm"
          >
            <span className="link-underline">{copy.googleReviewsLabel}</span>
            <ArrowIcon />
          </a>
        </div>
      )}
    </section>
  );
}

function ArrowButton({ label, onClick, disabled, flip }: { label: string; onClick: () => void; disabled: boolean; flip?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-12 place-items-center rounded-full border border-ink/25 transition-colors hover:bg-ink hover:text-bg disabled:pointer-events-none disabled:opacity-30"
    >
      <svg aria-hidden viewBox="0 0 24 24" className={cn("size-5", flip && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}
