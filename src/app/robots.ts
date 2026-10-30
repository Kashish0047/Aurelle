import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

/** /robots.txt — everything indexable except the APIs and the admin panel. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
