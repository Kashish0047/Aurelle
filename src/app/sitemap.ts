import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

/** /sitemap.xml — single-page site, so one URL. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
