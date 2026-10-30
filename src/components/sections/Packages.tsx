"use client";

import { useRef } from "react";
import { contentConfig } from "@/config/content.config";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { gsap, useGSAP } from "@/lib/gsap";
import { fill } from "@/lib/template";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { useSiteContent } from "@/lib/content/context";
import { ArrowIcon, ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";

/**
 * Bridal / spa packages: three tiers, the highlighted one in the middle and inverted.
 *
 * Scroll: the cards are "dealt" into place — side cards fan in from behind the centre card,
 * rotated and lowered, while the centre card rises and settles (scrubbed on desktop;
 * a simple staggered rise on mobile). Hover: gentle 3D tilt toward the pointer.
 * "Enquire" opens WhatsApp with a message naming the package.
 */
export function Packages() {
  const root = useRef<HTMLElement>(null);
  const copy = contentConfig.packages;
  const { packages, site } = useSiteContent();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".package-card");
        const middle = (cards.length - 1) / 2;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ".package-grid", start: "top 90%", end: "top 35%", scrub: 0.8 },
        });
        cards.forEach((card, i) => {
          const side = i - middle; // -1 left, 0 centre, +1 right
          tl.fromTo(
            card,
            { xPercent: side * -55, yPercent: 18 + Math.abs(side) * 10, rotate: side * 7, opacity: 0.4 },
            { xPercent: 0, yPercent: 0, rotate: 0, opacity: 1 },
            0,
          );
        });
      });

      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".package-card").forEach((card) => {
          gsap.from(card, {
            y: 60,
            opacity: 0,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="packages" aria-labelledby="packages-title" className="section-pad relative overflow-hidden bg-bg">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 size-[44rem] -translate-x-1/2 rounded-full bg-glow/35 blur-[150px]" />

      <div className="container-site relative">
        <SectionHeading
          id="packages-title"
          eyebrow={copy.eyebrow}
          title={copy.title}
          intro={copy.intro}
          className="mx-auto text-center [&_p]:mx-auto"
        />

        <ul className="package-grid mt-16 grid items-center gap-6 md:mt-24 md:grid-cols-3 lg:gap-8">
          {packages.map((pkg) => {
            const featured = pkg.highlighted === true;
            const enquireHref = buildWhatsAppLink(fill(copy.enquiryMessage, { package: pkg.name }), site.contact.whatsapp);
            return (
              <li key={pkg.id} className={cn("package-card", featured && "md:z-10")}>
                <TiltCard
                  className={cn(
                    "relative flex flex-col rounded-[2rem] border p-8 lg:p-10",
                    featured
                      ? "border-ink bg-ink text-bg shadow-[0_40px_100px_-40px_var(--accent)] md:py-14"
                      : "border-line bg-surface",
                  )}
                >
                  {featured && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.2em] text-accent-contrast">
                      {copy.highlightLabel}
                    </span>
                  )}

                  <p className={cn("text-[0.7rem] uppercase tracking-[0.22em]", featured ? "text-bg/70" : "text-muted")}>
                    {pkg.tagline}
                  </p>
                  <h3 className="mt-3 font-serif text-4xl">{pkg.name}</h3>

                  <p className="mt-6 font-serif text-5xl leading-none">{formatPrice(pkg.price, pkg.priceFrom)}</p>
                  {pkg.priceNote && (
                    <p className={cn("mt-2 text-sm", featured ? "text-bg/70" : "text-muted")}>{pkg.priceNote}</p>
                  )}

                  <ul className={cn("mt-8 flex flex-col gap-3 border-t pt-8 text-sm", featured ? "border-bg/20" : "border-line")}>
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex gap-3">
                        <svg aria-hidden viewBox="0 0 20 20" className={cn("mt-0.5 size-3.5 shrink-0", featured ? "text-gold" : "text-accent")} fill="currentColor">
                          <path d="M10 0c.6 5.2 4.8 9.4 10 10-5.2.6-9.4 4.8-10 10-.6-5.2-4.8-9.4-10-10C5.2 9.4 9.4 5.2 10 0Z" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <ButtonLink
                    href={enquireHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant={featured ? "accent" : "outline"}
                    className="mt-10 w-full"
                    aria-label={`${pkg.ctaLabel}: ${pkg.name}`}
                  >
                    {pkg.ctaLabel}
                    <ArrowIcon />
                  </ButtonLink>
                </TiltCard>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
