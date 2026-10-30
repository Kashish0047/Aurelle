"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { MotionConfig } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useHasFinePointer } from "@/lib/hooks/useMediaQuery";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { INTRO_DONE_EVENT } from "@/lib/motion";
import { lenisStore } from "./lenisStore";
import { scrollToTarget } from "./useSmoothScroll";

interface Props {
  enabled: boolean;
  children: ReactNode;
}

/**
 * Boots Lenis smooth scrolling and wires it into GSAP:
 *  1. Lenis is driven by GSAP's ticker (one shared rAF loop → no jitter between the two).
 *  2. Every Lenis scroll event calls ScrollTrigger.update, so pinned/scrubbed scenes
 *     read the smoothed position, not the raw one.
 *  3. lagSmoothing(0) stops GSAP from "catching up" after a dropped frame,
 *     which would otherwise cause visible jumps in scrubbed timelines.
 * Disabled for reduced motion and on touch devices (Lenis doesn't smooth touch scrolling, but its
 * frame loop would still run on every frame) — native scrolling is used there instead.
 *
 * Also intercepts in-page anchor clicks (#services etc.) so they glide via Lenis
 * and move keyboard focus to the target section for screen-reader users.
 */
export function SmoothScrollProvider({ enabled, children }: Props) {
  const reducedMotion = useReducedMotion();
  const finePointer = useHasFinePointer();

  useEffect(() => {
    if (!enabled || reducedMotion || !finePointer) return;

    const lenis = new Lenis({
      lerp: 0.1, // lower = floatier. 0.1 feels luxurious without feeling laggy.
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenisStore.set(lenis);

    // Keep the page frozen while the preloader curtain is down.
    const resume = () => lenis.start();
    if (document.documentElement.dataset.intro !== "done") {
      lenis.stop();
      window.addEventListener(INTRO_DONE_EVENT, resume, { once: true });
    }

    return () => {
      window.removeEventListener(INTRO_DONE_EVENT, resume);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisStore.set(null);
    };
  }, [enabled, reducedMotion, finePointer]);

  // Delegated anchor handling (works with or without Lenis).
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;
      event.preventDefault();
      scrollToTarget(target);
      history.replaceState(null, "", hash);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Framer Motion: honour the OS reduced-motion setting everywhere (transforms off, fades kept).
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
