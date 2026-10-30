import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { sansFont, serifFont } from "@/config/fonts";
import { siteConfig } from "@/config/site.config";
import { getSiteContent } from "@/lib/content/server";
import { INTRO_SESSION_KEY } from "@/lib/motion";
import { siteUrl } from "@/lib/site-url";
import { getActiveTheme, themeToCssVars } from "@/lib/theme";

const { features } = siteConfig;

/** Title, description and share card: admin settings when connected, otherwise site.config.ts. */
export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getSiteContent();
  const { seo } = site;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: seo.defaultTitle, template: seo.titleTemplate },
    description: site.description,
    keywords: seo.keywords,
    applicationName: site.fullName,
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
    // Phone numbers are already proper tel: links; stop iOS restyling other digits (prices, years).
    formatDetection: { telephone: false },
    openGraph: {
      type: "website",
      url: siteUrl,
      siteName: site.fullName,
      title: seo.defaultTitle,
      description: site.description,
      locale: site.locale.replace("-", "_"),
      images: [{ url: seo.ogImage.src, alt: seo.ogImage.alt, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.defaultTitle,
      description: site.description,
      images: [seo.ogImage.src],
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const theme = getActiveTheme((await getSiteContent()).site.theme);
  return { width: "device-width", initialScale: 1, themeColor: theme.colors.bg, colorScheme: theme.scheme };
}

/**
 * Runs before first paint: if the intro was already played this session (or the visitor
 * prefers reduced motion), mark it done so the preloader never flashes.
 * `data-intro-skip` hides the preloader via CSS; `data-intro="done"` releases the hero.
 */
const introScript = `(function(){try{var d=document.documentElement;if(sessionStorage.getItem(${JSON.stringify(
  INTRO_SESSION_KEY,
)})||matchMedia('(prefers-reduced-motion: reduce)').matches){d.setAttribute('data-intro','done');d.setAttribute('data-intro-skip','')}}catch(e){}})();`;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const preloaderOn = features.preloader;
  const theme = getActiveTheme((await getSiteContent()).site.theme);

  return (
    <html
      lang={siteConfig.locale}
      className={`${serifFont.variable} ${sansFont.variable}`}
      style={themeToCssVars(theme)}
      data-intro={preloaderOn ? undefined : "done"}
      data-intro-skip={preloaderOn ? undefined : ""}
      // The intro script may add data attributes before React hydrates.
      suppressHydrationWarning
    >
      <head>
        {/* Flags that JS is running, so reveal-from-hidden styles only apply when they can animate. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {preloaderOn && <script dangerouslySetInnerHTML={{ __html: introScript }} />}
      </head>
      {/* Site chrome (navbar, footer, preloader…) lives in (site)/layout.tsx; /admin has its own. */}
      <body>{children}</body>
    </html>
  );
}
