import type { ReactNode } from "react";
import { contentConfig } from "@/config/content.config";
import { SiteContentProvider } from "@/lib/content/context";
import { getSiteContent } from "@/lib/content/server";
import { SmoothScrollProvider } from "@/lib/scroll/SmoothScrollProvider";
import { Footer } from "@/components/sections/Footer";
import { Navbar } from "@/components/sections/Navbar";
import { Preloader } from "@/components/sections/Preloader";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

/**
 * Public website chrome: preloader, navbar, footer, cursor, grain, WhatsApp button, smooth scroll.
 * The site content (database or config — see lib/content) is resolved here once and shared with
 * every client section through SiteContentProvider.
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const content = await getSiteContent();
  const { features } = content.site;
  return (
    <SiteContentProvider value={content}>
      <noscript>
        <style>{`.preloader{display:none!important}`}</style>
      </noscript>
      <a
        href="#main"
        className="sr-only z-[110] rounded-full bg-ink px-5 py-3 text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {contentConfig.ui.skipToContent}
      </a>

      <SmoothScrollProvider enabled={features.smoothScroll}>
        {features.preloader && <Preloader />}
        <Navbar />
        {children}
        <Footer content={content} />
        {features.whatsappButton && <WhatsAppButton />}
      </SmoothScrollProvider>

      {features.customCursor && <CustomCursor />}
      {features.grain && <GrainOverlay />}
    </SiteContentProvider>
  );
}
