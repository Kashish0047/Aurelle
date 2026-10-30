"use client";

import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { ACCEPT_ATTR } from "@/lib/admin/compress";
import { uploadImage } from "@/lib/admin/upload";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/admin/Toaster";
import { createGalleryItems } from "./actions";

const MAX_FILES = 20;

/**
 * Drop or pick up to 20 photos → each is shrunk and uploaded in turn → all are added to the
 * gallery in one go (as square tiles; edit any of them afterwards for captions, size or before/after).
 */
export function GalleryUploader({ highlight }: { highlight: boolean }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLLabelElement>(null);
  const router = useRouter();
  const toast = useToast();
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (highlight) labelRef.current?.focus();
  }, [highlight]);

  const run = async (list: FileList | File[]) => {
    const files = [...list].filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    const chosen = files.slice(0, MAX_FILES);
    const errors: string[] = files.length > MAX_FILES ? [`Only the first ${MAX_FILES} photos were used. Add the rest in a second go.`] : [];
    const urls: string[] = [];
    setProblems([]);
    setProgress({ done: 0, total: chosen.length });
    for (const [i, file] of chosen.entries()) {
      try {
        urls.push(await uploadImage(file, "gallery"));
      } catch (e) {
        errors.push(`${file.name}: ${e instanceof Error ? e.message : "upload failed."}`);
      }
      setProgress({ done: i + 1, total: chosen.length });
    }
    if (urls.length) {
      const result = await createGalleryItems({ urls });
      if (result.ok) {
        toast(urls.length === 1 ? "1 photo added" : `${urls.length} photos added`);
        router.refresh();
      } else {
        errors.push(result.error);
      }
    }
    setProblems(errors);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!progress) void run(e.dataTransfer.files);
  };

  const working = progress !== null;

  return (
    <div className="mb-8">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-line bg-surface px-6 py-8 text-center transition-colors",
          dragging && "border-ink bg-bg-alt",
          highlight && "ring-2 ring-accent/50",
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          className="sr-only"
          disabled={working}
          onChange={(e) => e.target.files && void run(e.target.files)}
        />
        {working ? (
          <div role="status" className="w-full max-w-xs">
            <p className="text-sm">
              Uploading {Math.min(progress.done + 1, progress.total)} of {progress.total}…
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-alt">
              <div className="h-full bg-ink transition-[width]" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm">Drag photos here, or</p>
            <label
              ref={labelRef}
              htmlFor={inputId}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              className="cursor-pointer rounded-full bg-ink px-5 py-2.5 text-sm text-bg transition-opacity hover:opacity-90"
            >
              Choose photos
            </label>
            <p className="text-xs text-muted">Up to {MAX_FILES} at once · JPG, PNG or WebP, up to 5 MB each. We resize them for you.</p>
          </>
        )}
      </div>
      {problems.length > 0 && (
        <ul role="alert" className="mt-3 flex flex-col gap-1 text-xs text-accent">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
