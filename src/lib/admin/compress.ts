"use client";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const ACCEPT_ATTR = ACCEPTED.join(",");

/**
 * Checks and shrinks a photo in the browser before upload:
 *  - only JPG / PNG / WebP / AVIF under 5 MB
 *  - the file must actually decode as an image (a renamed .exe/.svg fails here)
 *  - resized so the longest side is at most 1600 px, re-encoded as WebP (JPEG fallback)
 * A typical 4 MB phone photo becomes ~150–300 KB.
 */
export async function compressImage(file: File, maxSide = 1600, quality = 0.82): Promise<Blob> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Please choose a JPG, PNG or WebP photo.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("This photo is larger than 5 MB. Please choose a smaller one.");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This file couldn't be opened as a photo.");
  }

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't process this photo.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const toBlob = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  const webp = await toBlob("image/webp");
  const blob = webp?.type === "image/webp" ? webp : await toBlob("image/jpeg");
  if (!blob) throw new Error("Your browser couldn't process this photo.");
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error("This photo is still too large after resizing.");
  return blob;
}
