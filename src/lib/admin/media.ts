import { supabaseUrl } from "@/lib/supabase/config";

export const MEDIA_BUCKET = "site-media";
const PUBLIC_PREFIX = `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/`;

/** Path inside the bucket for one of our uploaded images, or null for anything else. */
export function mediaPathFromUrl(url: string): string | null {
  return supabaseUrl && url.startsWith(PUBLIC_PREFIX) ? decodeURIComponent(url.slice(PUBLIC_PREFIX.length)) : null;
}

/**
 * Images may only come from our own bucket, or be one of the template's bundled files
 * ("/images/…"). This blocks hot-linking arbitrary external URLs into the site.
 */
export function isAllowedImageUrl(url: string): boolean {
  return /^\/images\/[\w\-./]+\.(?:jpe?g|png|webp|avif)$/i.test(url) || mediaPathFromUrl(url) !== null;
}
