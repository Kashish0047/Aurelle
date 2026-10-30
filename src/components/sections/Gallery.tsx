"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { contentConfig } from "@/config/content.config";
import { useSiteContent } from "@/lib/content/context";
import type { GalleryItem, GallerySize } from "@/config/types";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import { Lightbox, type LightboxItem } from "@/components/ui/Lightbox";
import { SectionHeading } from "@/components/ui/SectionHeading";

const ASPECT: Record<GallerySize, string> = {
  tall: "aspect-[3/4]",
  square: "aspect-square",
  wide: "aspect-[4/3]",
};
const HEIGHT: Record<GallerySize, number> = { tall: 4 / 3, square: 1, wide: 3 / 4 };

/** yPercent drift per column (start → minus this). Different speeds create the layered feel. */
const COLUMN_DRIFT = [6, 14, 3];

/** Greedy masonry: each item goes to the currently shortest column, keeping config order. */
function distribute(items: GalleryItem[], columns: number): GalleryItem[][] {
  const cols: GalleryItem[][] = Array.from({ length: columns }, () => []);
  const heights = new Array<number>(columns).fill(0);
  for (const item of items) {
    const shortest = heights.indexOf(Math.min(...heights));
    cols[shortest]!.push(item);
    heights[shortest]! += HEIGHT[item.size];
  }
  return cols;
}

/** Only plain images go in the lightbox; before/after items are interactive in place. */
function lightboxFor(gallery: GalleryItem[]) {
  const items: LightboxItem[] = gallery.flatMap((item) =>
    item.type === "image" ? [{ image: item.image, caption: item.caption }] : [],
  );
  const index = new Map(gallery.filter((i) => i.type === "image").map((item, i) => [item.id, i] as const));
  return { items, index };
}

/**
 * Lookbook. Masonry columns that drift at different speeds while scrolling (parallax),
 * hover zoom on each photo, click/Enter to open the fullscreen lightbox.
 * Before/after items render as a draggable comparison slider.
 */
export function Gallery() {
  const { gallery: copy, ui } = contentConfig;
  const { gallery } = useSiteContent();
  const { items: lightboxItems, index: lightboxIndex } = useMemo(() => lightboxFor(gallery), [gallery]);
  const root = useRef<HTMLElement>(null);
  // Server assumes phone layout (mobile-first): phones then hydrate with no re-render.
  const isMd = useMediaQuery("(min-width: 768px)");
  const columns = useMemo(() => distribute(gallery, isMd ? 3 : 2), [gallery, isMd]);
  const [open, setOpen] = useState<number | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Each column travels a different distance across the same scroll range.
        gsap.utils.toArray<HTMLElement>(".gallery-col").forEach((col, i) => {
          const drift = (COLUMN_DRIFT[i % COLUMN_DRIFT.length] ?? 6) * (isMd ? 1 : 0.6);
          gsap.fromTo(
            col,
            { yPercent: drift },
            {
              yPercent: -drift,
              ease: "none",
              scrollTrigger: { trigger: ".gallery-grid", start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });
      });
    },
    { scope: root, dependencies: [isMd], revertOnUpdate: true },
  );

  const sizes = isMd ? "(min-width: 1440px) 460px, 33vw" : "50vw";

  return (
    <section ref={root} id="gallery" aria-labelledby="gallery-title" className="section-pad relative overflow-hidden bg-bg">
      <div className="container-site">
        <SectionHeading id="gallery-title" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />

        <div className="gallery-grid mt-16 flex gap-3 md:mt-24 md:gap-6">
          {columns.map((col, c) => (
            <div key={c} className={cn("gallery-col flex flex-1 flex-col gap-3 md:gap-6", c === 1 && "md:pt-24")}>
              {col.map((item) =>
                item.type === "before-after" ? (
                  <figure key={item.id} className="flex flex-col gap-3">
                    <BeforeAfter
                      before={item.before}
                      after={item.after}
                      labels={{ before: ui.before, after: ui.after, compare: ui.compare }}
                      sizes={sizes}
                      className={cn(ASPECT[item.size], "rounded-[1.5rem]")}
                    />
                    <figcaption className="px-1 font-serif text-lg italic text-muted">{item.caption}</figcaption>
                  </figure>
                ) : (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOpen(lightboxIndex.get(item.id) ?? 0)}
                    data-cursor={ui.view}
                    aria-label={`${ui.view}: ${item.caption ?? item.image.alt}`}
                    className={cn("group relative block w-full overflow-hidden rounded-[1.5rem]", ASPECT[item.size])}
                  >
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      fill
                      sizes={sizes}
                      className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.07]"
                    />
                    {item.caption && (
                      <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/60 to-transparent px-4 pb-4 pt-12 text-left font-serif text-lg italic text-bg transition-opacity duration-500 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
                        {item.caption}
                      </span>
                    )}
                  </button>
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <Lightbox
        items={lightboxItems}
        index={open}
        onIndexChange={setOpen}
        labels={{ close: ui.close, previous: ui.previous, next: ui.next }}
      />
    </section>
  );
}
