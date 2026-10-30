import type { SocialPlatform } from "@/config/types";

/** Display names for social platforms (overridable per link via `label` in site.config). */
export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  pinterest: "Pinterest",
  tiktok: "TikTok",
  x: "X",
  linkedin: "LinkedIn",
};
