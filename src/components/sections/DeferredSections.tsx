"use client";

import { lazy, Suspense, type ComponentType } from "react";
import type { DeferredSectionKey } from "@/lib/sections";

/**
 * Deferred hydration for below-the-fold sections.
 *
 * The server still renders their full HTML (visible immediately, crawlable by Google).
 * In the browser, each section's JavaScript is only downloaded and hydrated when the visitor
 * scrolls within ~1 screen of it. Until then React leaves the server HTML untouched, so the
 * first load does far less main-thread work on phones.
 *
 * Only sections WITHOUT pinned scroll scenes are deferred: a pin created late would add page
 * height above the visitor and make the page jump. Booking stays eager because "Book this"
 * buttons must be able to reach it instantly.
 */
type SectionModule = { default: ComponentType };

function whenNear(id: string, load: () => Promise<SectionModule>) {
  return () => {
    if (typeof window === "undefined") return load();
    return new Promise<SectionModule>((resolve) => {
      const el = document.getElementById(id);
      if (!el || !("IntersectionObserver" in window)) return void load().then(resolve);
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          io.disconnect();
          void load().then(resolve);
        },
        { rootMargin: "100% 0px" },
      );
      io.observe(el);
    });
  };
}

const deferred: Record<DeferredSectionKey, ComponentType> = {
  process: lazy(whenNear("process", () => import("./Process").then((m) => ({ default: m.Process })))),
  gallery: lazy(whenNear("gallery", () => import("./Gallery").then((m) => ({ default: m.Gallery })))),
  team: lazy(whenNear("team", () => import("./Team").then((m) => ({ default: m.Team })))),
  packages: lazy(whenNear("packages", () => import("./Packages").then((m) => ({ default: m.Packages })))),
  testimonials: lazy(whenNear("testimonials", () => import("./Testimonials").then((m) => ({ default: m.Testimonials })))),
  offers: lazy(whenNear("offers", () => import("./Offers").then((m) => ({ default: m.Offers })))),
  faq: lazy(whenNear("faq", () => import("./Faq").then((m) => ({ default: m.Faq })))),
};

export function DeferredSection({ name }: { name: DeferredSectionKey }) {
  const Section = deferred[name];
  return (
    <Suspense fallback={null}>
      <Section />
    </Suspense>
  );
}
