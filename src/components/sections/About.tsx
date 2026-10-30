"use client";

import { useRef } from "react";
import Image from "next/image";
import { contentConfig } from "@/config/content.config";
import { gsap, useGSAP } from "@/lib/gsap";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";

/** Oval → arch. Both strings use identical units/count so GSAP can interpolate every number. */
const CLIP_FROM = "inset(18% 20% 18% 20% round 400px 400px 400px 400px)";
const CLIP_TO = "inset(0% 0% 0% 0% round 400px 400px 28px 28px)";

/**
 * Story section.
 * Desktop: the stage pins for ~1.5 screens while (a) the statement lights up word by word
 * and (b) the image opens from a small oval into a full arch, its photo settling from 1.3× zoom.
 * Mobile: same effects, scrubbed without pinning (pinning tall content on phones feels sticky).
 * Below the stage: body copy and stats that count up on first view.
 */
export function About() {
  const root = useRef<HTMLElement>(null);
  const { about } = contentConfig;
  const words = about.statement.split(" ");

  useGSAP(
    () => {
      // Words go from the muted text colour to the full one. Both pass WCAG contrast, so the
      // statement stays readable at every point of the scroll (opacity fades would not).
      const css = getComputedStyle(document.documentElement);
      const muted = { color: css.getPropertyValue("--text-muted").trim() };
      const full = { color: css.getPropertyValue("--text").trim() };
      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const { desktop } = ctx.conditions as { desktop: boolean };
          const wordEls = gsap.utils.toArray<HTMLElement>(".about-word");

          if (desktop) {
            // One pinned, scrubbed timeline: words light up across the whole pin,
            // while the image opens during the first ~60% of it.
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: ".about-stage",
                  start: "top top",
                  end: "+=150%",
                  pin: true,
                  scrub: 0.8,
                },
              })
              .fromTo(wordEls, muted, { ...full, stagger: 0.08, ease: "none" }, 0)
              .fromTo(".about-frame", { clipPath: CLIP_FROM }, { clipPath: CLIP_TO, ease: "power2.out", duration: 1.6 }, 0)
              .fromTo(".about-photo", { scale: 1.3 }, { scale: 1, ease: "power2.out", duration: 1.6 }, 0);
            return;
          }

          // Mobile: words light up as the statement travels through the viewport.
          gsap.fromTo(
            wordEls,
            muted,
            {
              ...full,
              stagger: 0.08,
              ease: "none",
              scrollTrigger: { trigger: ".about-statement", start: "top 80%", end: "bottom 45%", scrub: 0.6 },
            },
          );
          // Image opens as it rises into view.
          gsap
            .timeline({ scrollTrigger: { trigger: ".about-frame", start: "top 95%", end: "center 55%", scrub: 0.6 } })
            .fromTo(".about-frame", { clipPath: CLIP_FROM }, { clipPath: CLIP_TO, ease: "none" }, 0)
            .fromTo(".about-photo", { scale: 1.3 }, { scale: 1, ease: "none" }, 0);
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about" aria-labelledby="about-title" className="relative bg-bg">
      <div className="about-stage flex min-h-[100svh] items-center py-24 md:py-0">
        <div className="container-site grid items-center gap-12 md:grid-cols-[1.25fr_0.75fr] md:gap-16 lg:gap-24">
          <div>
            <p className="eyebrow">{about.eyebrow}</p>
            <h2 id="about-title" className="mt-3 font-serif text-2xl italic text-accent md:text-3xl">
              {about.title}
            </h2>
            <p className="about-statement mt-8 font-serif text-[clamp(1.85rem,1.2rem+2.6vw,3.6rem)] leading-[1.12] tracking-[-0.01em]">
              {words.map((word, i) => (
                <span key={i}>
                  <span className="about-word">{word}</span>{" "}
                </span>
              ))}
            </p>
          </div>

          <div className="about-frame relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-t-[400px] rounded-b-[28px] md:max-h-[72svh] md:max-w-none">
            <Image
              src={about.image.src}
              alt={about.image.alt}
              fill
              sizes="(min-width: 768px) 35vw, 90vw"
              className="about-photo object-cover"
            />
          </div>
        </div>
      </div>

      <div className="container-site grid gap-14 pb-28 pt-8 md:grid-cols-[1fr_1.4fr] md:gap-20 md:pb-40 md:pt-16">
        <Reveal>
          <p className="max-w-md text-lead text-muted">{about.body}</p>
        </Reveal>

        <dl className="grid grid-cols-3 gap-4 border-t border-line pt-8 md:gap-8">
          {about.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.1} className="flex flex-col-reverse gap-2">
              <dt className="text-xs uppercase tracking-[0.18em] text-muted md:text-sm">{stat.label}</dt>
              <dd className="font-serif text-[clamp(2.4rem,1.5rem+4vw,5.5rem)] leading-none">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
