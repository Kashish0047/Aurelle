import { siteConfig } from "@/config/site.config";

/** Production URL: env var wins (handy for preview deploys), then site.config.ts. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url).replace(/\/$/, "");
