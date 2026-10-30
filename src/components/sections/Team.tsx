"use client";

import { useRef } from "react";
import Image from "next/image";
import { contentConfig } from "@/config/content.config";
import { useSiteContent } from "@/lib/content/context";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { GSAP_EASE_IN_OUT } from "@/lib/motion";
import { SOCIAL_LABELS } from "@/lib/socials";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Team grid.
 * Scroll: portraits are revealed by a curtain wiping upward (clip-path) while the photo inside
 * settles from 1.25× zoom — triggered in batches as rows enter, so a row reveals together.
 * Hover (desktop): the portrait warms from soft monochrome to full colour, zooms slightly,
 * and a frosted panel with the artist's speciality slides up.
 */
export function Team() {
  const root = useRef<HTMLElement>(null);
  const copy = contentConfig.team;
  const { team } = useSiteContent();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(".team-frame", { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(".team-zoom", { scale: 1.25 });
        ScrollTrigger.batch(".team-card", {
          start: "top 88%",
          once: true,
          onEnter: (cards) => {
            const frames = cards.map((c) => c.querySelector(".team-frame"));
            const zooms = cards.map((c) => c.querySelector(".team-zoom"));
            gsap.to(frames, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: GSAP_EASE_IN_OUT, stagger: 0.12 });
            gsap.to(zooms, { scale: 1, duration: 1.8, ease: "expo.out", stagger: 0.12 });
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="team" aria-labelledby="team-title" className="section-pad relative bg-bg-alt">
      <div className="container-site">
        <SectionHeading id="team-title" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />

        <ul className="mt-16 grid grid-cols-2 gap-x-4 gap-y-12 md:mt-24 lg:grid-cols-4 lg:gap-x-8">
          {team.map((member) => (
            <li key={member.id} className="team-card group">
              <div className="team-frame relative aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-bg">
                <div className="team-zoom absolute inset-0">
                  <Image
                    src={member.image.src}
                    alt={member.image.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-[filter,transform] duration-700 ease-out-expo md:grayscale-[0.8] md:group-hover:scale-105 md:group-hover:grayscale-0"
                  />
                </div>
                <div className="absolute inset-x-3 bottom-3 hidden translate-y-[calc(100%+1rem)] rounded-2xl bg-surface/85 p-4 backdrop-blur-md transition-transform duration-700 ease-out-expo group-hover:translate-y-0 group-focus-within:translate-y-0 md:block">
                  <p className="text-[0.7rem] uppercase tracking-[0.2em] text-muted">{copy.specialtyLabel}</p>
                  <p className="mt-1 font-serif text-xl">{member.specialty}</p>
                </div>
              </div>

              <h3 className="mt-5 font-serif text-2xl md:text-3xl">{member.name}</h3>
              <p className="mt-1 text-sm text-muted">{member.role}</p>
              <p className="mt-1 text-sm text-accent md:hidden">{member.specialty}</p>
              {member.instagram && (
                <a
                  href={member.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline mt-2 inline-block text-sm"
                >
                  {SOCIAL_LABELS.instagram}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
