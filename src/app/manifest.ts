import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/content/server";
import { getActiveTheme } from "@/lib/theme";

/** /manifest.webmanifest — name and colours for "Add to Home Screen" on phones. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { site: siteConfig } = await getSiteContent();
  const { colors } = getActiveTheme(siteConfig.theme);
  return {
    name: siteConfig.fullName,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: colors.bg,
    theme_color: colors.bg,
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
