"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { ACCEPT_ATTR } from "@/lib/admin/compress";
import { uploadImage } from "@/lib/admin/upload";
import { cn } from "@/lib/cn";

interface Props {
  /** Current image URL ("" = none). */
  value: string;
  onChange: (url: string) => void;
  /** Folder inside the site-media bucket, e.g. "services". */
  folder: string;
  label: string;
  hint?: string;
  /** Tailwind aspect class for the preview box. */
  aspect?: string;
  error?: string;
}

/**
 * Pick → check → shrink (WebP, ≤1600px) → upload to Supabase Storage → preview.
 * Upload goes straight from the browser with the admin's session; the bucket's storage policy
 * only accepts it from admins. Replacing or removing an image only changes the form — the old
 * file is deleted from Storage when the form is saved.
 */
export function ImageUploader({ value, onChange, folder, label, hint, aspect = "aspect-[4/5]", error }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const upload = async (file: File) => {
    setStatus("working");
    setMessage("Optimising and uploading…");
    try {
      onChange(await uploadImage(file, folder));
      setStatus("idle");
      setMessage(null);
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const working = status === "working";

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm">{label}</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className={cn("relative w-40 shrink-0 overflow-hidden rounded-2xl border border-line bg-bg-alt", aspect)}>
          {value ? (
            <Image src={value} alt="" fill sizes="160px" unoptimized className="object-cover" />
          ) : (
            <span className="absolute inset-0 grid place-items-center px-3 text-center text-xs text-muted">No photo yet</span>
          )}
          {working && <span className="absolute inset-0 animate-pulse bg-surface/70" />}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPT_ATTR}
            className="sr-only"
            disabled={working}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={inputId}
              className={cn(
                "cursor-pointer rounded-full border border-ink px-4 py-2 text-sm transition-colors hover:bg-ink hover:text-bg",
                working && "pointer-events-none opacity-50",
              )}
            >
              {value ? "Replace photo" : "Upload photo"}
            </label>
            {value && !working && (
              <button type="button" onClick={() => onChange("")} className="rounded-full px-4 py-2 text-sm text-muted hover:bg-bg-alt">
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-muted">{hint ?? "JPG, PNG or WebP, up to 5 MB. We resize it for you."}</p>
          {message && (
            <p role={status === "error" ? "alert" : "status"} className={cn("text-xs", status === "error" ? "text-accent" : "text-muted")}>
              {message}
            </p>
          )}
          {error && <p className="text-xs text-accent">{error}</p>}
        </div>
      </div>
    </div>
  );
}
