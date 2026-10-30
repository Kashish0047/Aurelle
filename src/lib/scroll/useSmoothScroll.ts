"use client";

import { useMemo, useSyncExternalStore } from "react";
import { lenisStore } from "./lenisStore";

/**
 * Scrolls to an element (or y position) using Lenis when active, native smooth scroll otherwise.
 * Moves focus to the element afterwards so keyboard users land in the right place.
 */
export function scrollToTarget(target: HTMLElement | number, options: { offset?: number } = {}) {
  const lenis = lenisStore.get();
  const offset = options.offset ?? 0;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const focusTarget = () => {
    if (typeof target === "number") return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.4, onComplete: focusTarget });
    return;
  }
  const y =
    typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  focusTarget();
}

/**
 * Access the smooth-scroll engine from any component.
 * `lock()`/`unlock()` freeze page scrolling (used by the mobile menu, lightbox, preloader).
 */
export function useSmoothScroll() {
  const lenis = useSyncExternalStore(lenisStore.subscribe, lenisStore.get, () => null);

  return useMemo(
    () => ({
      lenis,
      scrollTo: scrollToTarget,
      lock() {
        lenis?.stop();
        document.documentElement.style.overflow = "hidden";
      },
      unlock() {
        lenis?.start();
        document.documentElement.style.overflow = "";
      },
    }),
    [lenis],
  );
}
