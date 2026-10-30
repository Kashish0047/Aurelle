"use client";

import { useRef } from "react";
import { contentConfig } from "@/config/content.config";
import { gsap, useGSAP } from "@/lib/gsap";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Wave through the four dot centres (x = 125, 375, 625, 875 in a 1000-wide viewBox). */
const WAVE = "M125 50 C 208 0, 292 100, 375 50 S 542 0, 625 50 S 792 100, 875 50";

/**
 * "Why us" steps joined by a line that draws itself as you scroll.
 * Desktop: a wave connects the numbered dots left → right. Mobile: a vertical line grows downward.
 * Each step lights up (dot fills with the accent, text brightens) exactly when the line reaches it,
 * because the step activations sit on the same scrubbed timeline at proportional positions.
 */
export function Process() {
  const root = useRef<HTMLElement>(null);
  const { process } = contentConfig;
  const steps = process.steps;

  useGSAP(
    () => {
      const css = getComputedStyle(document.documentElement);
      const accent = css.getPropertyValue("--accent").trim();
      const accentText = css.getPropertyValue("--accent-contrast").trim();
      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const { desktop } = ctx.conditions as { desktop: boolean };
          const items = gsap.utils.toArray<HTMLElement>(".process-step");
          const dots = gsap.utils.toArray<HTMLElement>(".process-dot");

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ".process-list",
              start: desktop ? "top 70%" : "top 75%",
              end: desktop ? "bottom 55%" : "bottom 60%",
              scrub: 0.8,
            },
          });

          // 1. The connector draws from the first step to the last over the whole timeline.
          if (desktop) tl.fromTo(".process-wave", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1 }, 0);
          else tl.fromTo(".process-vline", { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);

          // 2. Steps switch on as the line arrives (step i at i / (n-1) of the way).
          items.forEach((item, i) => {
            const at = steps.length > 1 ? (i / (steps.length - 1)) * 0.95 : 0;
            tl.fromTo(item, { opacity: 0.28, y: 16 }, { opacity: 1, y: 0, duration: 0.12 }, at);
            const dot = dots[i];
            if (dot) {
              tl.to(dot, { backgroundColor: accent, borderColor: accent, color: accentText, duration: 0.08 }, at);
            }
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="process" aria-labelledby="process-title" className="section-pad relative bg-bg">
      <div className="container-site">
        <SectionHeading id="process-title" eyebrow={process.eyebrow} title={process.title} />

        <div className="process-list relative mt-16 md:mt-24">
          {/* Desktop connector: faint base wave + the accent wave that draws on scroll */}
          <svg
            aria-hidden
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-16 w-full md:block"
          >
            <path d={WAVE} fill="none" stroke="var(--line)" strokeWidth="1.5" />
            <path
              className="process-wave"
              d={WAVE}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="0"
            />
          </svg>

          {/* Mobile connector */}
          <div aria-hidden className="absolute bottom-8 left-8 top-8 w-px bg-line md:hidden">
            <div className="process-vline absolute inset-0 origin-top bg-accent" />
          </div>

          <ol className="relative grid gap-12 md:grid-cols-4 md:gap-8">
            {steps.map((step, i) => (
              <li key={step.title} className="process-step flex gap-6 md:flex-col md:items-center md:text-center">
                <span className="process-dot relative z-10 grid size-16 shrink-0 place-items-center rounded-full border border-line bg-bg font-serif text-xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="pt-3 md:pt-4">
                  <h3 className="font-serif text-3xl">{step.title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted md:mx-auto">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
