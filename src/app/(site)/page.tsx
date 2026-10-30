import { Suspense, type ComponentType } from "react";
import type { SectionKey } from "@/config/types";
import { isDeferredSection, isSectionEnabled, SECTION_ORDER } from "@/lib/sections";
import { getSiteContent } from "@/lib/content/server";
import { beautySalonJsonLd, faqJsonLd, jsonLdString } from "@/lib/seo";
import { About } from "@/components/sections/About";
import { Booking } from "@/components/sections/Booking";
import { DeferredSection } from "@/components/sections/DeferredSections";
import { Hero } from "@/components/sections/Hero";
import { MarqueeStrip } from "@/components/sections/MarqueeStrip";
import { Services } from "@/components/sections/Services";

/**
 * Sections hydrated immediately: the marquee, sections with pinned scroll scenes, and Booking.
 * All other sections (Process, Gallery, Team, Packages, Testimonials, Offers, FAQ) are
 * server-rendered and hydrate only when scrolled near — see DeferredSections.tsx.
 */
const EAGER: Partial<Record<SectionKey, ComponentType>> = {
  marquee: MarqueeStrip,
  about: About,
  services: Services,
  booking: Booking,
};

/**
 * Single-page site. Sections read the site content (admin panel or /src/config — see lib/content)
 * and are toggled via its `sections`; order comes from SECTION_ORDER (lib/sections.ts).
 * Navbar, preloader and footer live in layout.tsx.
 */
export default async function HomePage() {
  const content = await getSiteContent();
  const on = (key: SectionKey) => isSectionEnabled(key, content.site.sections);
  return (
    <main id="main">
      {/* Structured data for Google (business details, hours, services, FAQ) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(beautySalonJsonLd(content)) }} />
      {on("faq") && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqJsonLd(content.faq)) }} />
      )}
      <Hero />
      {/* Each section is its own Suspense boundary, so React hydrates section by section and
          yields to the browser in between (shorter main-thread blocking on phones). */}
      {SECTION_ORDER.filter(on).map((key) => {
        if (isDeferredSection(key)) return <DeferredSection key={key} name={key} />;
        const Section = EAGER[key];
        return Section ? (
          <Suspense key={key}>
            <Section />
          </Suspense>
        ) : null;
      })}
    </main>
  );
}
