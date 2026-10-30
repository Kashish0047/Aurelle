"use client";

import { useMemo, useRef, useState, type RefObject } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { contentConfig } from "@/config/content.config";
import { siteConfig } from "@/config/site.config";
import { useSiteContent } from "@/lib/content/context";
import type { Service } from "@/config/types";
import { preselectService } from "@/lib/booking/selection";
import { cn } from "@/lib/cn";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useIsLowEnd } from "@/lib/hooks/useIsLowEnd";
import { useHasFinePointer, useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useNearViewport } from "@/lib/hooks/useNearViewport";
import { usePointerRef } from "@/lib/hooks/usePointerRef";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useWebGLTier } from "@/lib/hooks/useWebGLTier";
import { EASE_OUT } from "@/lib/motion";
import { isSectionEnabled } from "@/lib/sections";
import { scrollToTarget } from "@/lib/scroll/useSmoothScroll";
import { fill } from "@/lib/template";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { ServiceCard } from "@/components/ui/ServiceCard";

const BeautyCanvas = dynamic(() => import("@/components/three/BeautyCanvas"), { ssr: false });

type Filter = string;

/**
 * Signature section.
 *
 * Desktop (≥1024px, motion allowed): the section pins and vertical scrolling drives a
 * horizontal track — intro panel first, then the cards. As each card slides in from the right
 * it straightens and rises (containerAnimation). Behind the track, the hero's 3D product glides
 * right → left, morphing through the heroScene objects and taking each category's tint.
 *
 * Mobile / reduced motion: a regular responsive grid; cards fade in as they enter.
 *
 * Category chips filter the cards; "Book this" preselects the service in the booking form.
 */
export function Services() {
  const { services: copy } = contentConfig;
  const { services, serviceCategories, site } = useSiteContent();
  const categoryLabel = useMemo(() => new Map<string, string>(serviceCategories.map((c) => [c.id, c.label])), [serviceCategories]);
  /** Only show chips for categories that actually have services. */
  const usedCategories = useMemo(
    () => serviceCategories.filter((c) => services.some((s) => s.category === c.id)),
    [serviceCategories, services],
  );
  const [filter, setFilter] = useState<Filter>("all");
  const visible = useMemo(
    () => (filter === "all" ? services : services.filter((s) => s.category === filter)),
    [filter, services],
  );

  const root = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const progress = useRef(0);
  const filterChanged = useRef(false);

  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const horizontal = isDesktop && !reducedMotion;

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!horizontal || !track) return;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

      // Pin the stage; scrolling down moves the track left by its overflow width.
      const slide = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => void (progress.current = self.progress),
        },
      });

      // Each card enters tilted and lowered, then straightens as it crosses the right third.
      gsap.utils.toArray<HTMLElement>(".service-card-motion").forEach((card) => {
        gsap.fromTo(
          card,
          { yPercent: 10, rotate: 3, opacity: 0.35 },
          {
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              containerAnimation: slide,
              start: "left right",
              end: "left 65%",
              scrub: true,
            },
          },
        );
      });

      // After a filter change the page height changed: re-measure every trigger below.
      // (Not on first mount — ScrollTrigger already refreshes once on page load.)
      if (filterChanged.current) ScrollTrigger.refresh();
    },
    { scope: root, dependencies: [horizontal, filter], revertOnUpdate: true },
  );

  const changeFilter = (next: Filter) => {
    if (next === filter) return;
    filterChanged.current = true;
    setFilter(next);
    // A new filter means a new track length: restart from the beginning of the section.
    const section = root.current;
    if (section && window.scrollY > section.offsetTop + 10) scrollToTarget(section);
  };

  const onBook = (service: Service) => {
    if (isSectionEnabled("booking", site.sections)) {
      preselectService(service.id);
      const booking = document.getElementById("booking");
      if (booking) scrollToTarget(booking);
      return;
    }
    window.open(buildWhatsAppLink(fill(copy.whatsappMessage, { service: service.name }), site.contact.whatsapp), "_blank", "noopener");
  };

  return (
    <section ref={root} id="services" aria-labelledby="services-title" className="relative bg-bg-alt">
      <div
        ref={pinRef}
        className={cn("relative overflow-hidden", horizontal ? "flex h-[100svh] items-center" : "section-pad")}
      >
        {/* Ambient glow (always) + the travelling 3D bloom (desktop) */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 size-[50rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-glow/40 blur-[140px]" />
          {horizontal && <ServicesScene sectionRef={root} progress={progress} services={visible} />}
        </div>

        <ul
          ref={trackRef}
          className={cn(
            "relative",
            horizontal
              ? "flex w-max items-center gap-6 pl-[clamp(1rem,4vw,3.5rem)] pr-[12vw] will-change-transform"
              : "container-site grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {/* Intro panel: first item of the track on desktop, a full-width header on mobile */}
          <li className={cn(horizontal ? "w-[min(32rem,36vw)] shrink-0 pr-10" : "col-span-full mb-8")}>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 id="services-title" className="mt-4 text-headline">
              {copy.title}
            </h2>
            {copy.intro && <p className="mt-6 max-w-md text-lead text-muted">{copy.intro}</p>}

            <div role="group" aria-label={copy.title} className="mt-8 flex flex-wrap gap-2">
              {[{ id: "all" as const, label: copy.allLabel }, ...usedCategories].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={filter === cat.id}
                  onClick={() => changeFilter(cat.id)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors duration-300",
                    filter === cat.id
                      ? "border-ink bg-ink text-bg"
                      : "border-line bg-surface/50 hover:border-ink/40",
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </li>

          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((service, i) => (
              <motion.li
                key={service.id}
                layout={!horizontal}
                initial={horizontal ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                transition={{ duration: 0.7, ease: EASE_OUT, delay: horizontal ? 0 : (i % 3) * 0.08 }}
                className={horizontal ? "w-[clamp(18rem,23vw,23rem)] shrink-0" : undefined}
              >
                <div className="service-card-motion h-full">
                  <ServiceCard
                    service={service}
                    categoryLabel={categoryLabel.get(service.category) ?? ""}
                    bookLabel={copy.bookLabel}
                    popularLabel={copy.popularLabel}
                    onBook={onBook}
                    glass={horizontal}
                    className="h-full"
                  />
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </section>
  );
}

/**
 * The 3D product behind the services track: it travels with the scroll, morphs through the
 * heroScene objects and takes the tint of the category in view. Kept in its own component so the
 * device checks it needs only re-render this small piece after hydration — not the service cards.
 */
function ServicesScene({
  sectionRef,
  progress,
  services: list,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  progress: RefObject<number>;
  services: Service[];
}) {
  const near = useNearViewport(sectionRef);
  const webgl = useWebGLTier(near && siteConfig.heroVariant === "3d-scene");
  const lowEnd = useIsLowEnd();
  const finePointer = useHasFinePointer();
  const show = near && webgl === "hardware" && siteConfig.heroVariant === "3d-scene";
  const pointer = usePointerRef(show && finePointer);
  const categories = useMemo(() => list.map((s) => s.category), [list]);
  if (!show) return null;
  return (
    <BeautyCanvas
      mode="services"
      quality={lowEnd ? "lite" : "high"}
      categories={categories}
      scroll={progress}
      pointer={pointer}
    />
  );
}
