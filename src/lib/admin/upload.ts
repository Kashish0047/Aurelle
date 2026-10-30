"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { compressImage } from "./compress";
import { MEDIA_BUCKET } from "./media";

/**
 * Check → shrink (WebP, ≤1600px) → upload to site-media/{folder}/{uuid}.webp → public URL.
 * Runs in the browser with the admin's session; the bucket policy only accepts admins.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const blob = await compressImage(file);
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error("The upload didn't go through. Please check your connection and try again.");
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}
