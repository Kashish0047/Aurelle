"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { ImageAsset } from "@/config/types";
import { EASE_OUT } from "@/lib/motion";
import { useSmoothScroll } from "@/lib/scroll/useSmoothScroll";

export interface LightboxItem {
  image: ImageAsset;
  caption?: string;
}

interface Props {
  items: LightboxItem[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
  labels: { close: string; previous: string; next: string };
}

/**
 * Fullscreen image viewer.
 * - Opens with a fade; images slide in the direction of travel.
 * - Keyboard: ← → to browse, Esc to close. Focus is trapped inside and restored on close.
 * - Touch: swipe left/right (drag with velocity), page scroll locked while open.
 */
export function Lightbox({ items, index, onIndexChange, labels }: Props) {
  const [direction, setDirection] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { lock, unlock } = useSmoothScroll();
  const open = index !== null;
  const count = items.length;

  const go = (delta: number) => {
    if (index === null) return;
    setDirection(delta);
    onIndexChange((index + delta + count) % count);
  };

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    lock();
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onIndexChange(null);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab" && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>("button");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      unlock();
      previouslyFocused?.focus({ preventScroll: true });
    };
    // `go` changes every render; the listener only needs the latest index, captured via deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  const current = index !== null ? items[index] : undefined;

  return (
    <AnimatePresence>
      {current && index !== null && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={current.caption ?? current.image.alt}
          className="fixed inset-0 z-[120] flex flex-col bg-ink/95 text-bg backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          data-lenis-prevent
        >
          <div className="flex items-center justify-between px-5 py-4 text-sm md:px-8">
            <span className="tabular-nums tracking-widest text-bg/70" aria-live="polite">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={() => onIndexChange(null)}
              className="grid size-11 place-items-center rounded-full border border-bg/30 transition-colors hover:bg-bg hover:text-ink"
              aria-label={labels.close}
            >
              <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={index}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ x: d >= 0 ? 120 : -120, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: d >= 0 ? -120 : 120, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: EASE_OUT }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80 || info.velocity.x < -500) go(1);
                  else if (info.offset.x > 80 || info.velocity.x > 500) go(-1);
                }}
                className="absolute inset-4 cursor-grab active:cursor-grabbing md:inset-x-24 md:inset-y-6"
              >
                <Image
                  src={current.image.src}
                  alt={current.image.alt}
                  fill
                  sizes="100vw"
                  className="pointer-events-none object-contain"
                  draggable={false}
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {count > 1 && (
              <>
                <NavButton side="left" label={labels.previous} onClick={() => go(-1)} />
                <NavButton side="right" label={labels.next} onClick={() => go(1)} />
              </>
            )}
          </div>

          <p className="min-h-14 px-5 py-4 text-center font-serif text-xl italic text-bg/85 md:px-8">
            {current.caption}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NavButton({ side, label, onClick }: { side: "left" | "right"; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-bg/30 bg-ink/40 backdrop-blur transition-colors hover:bg-bg hover:text-ink md:grid ${side === "left" ? "left-6" : "right-6"}`}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d={side === "left" ? "M15 6l-6 6 6 6" : "m9 6 6 6-6 6"} />
      </svg>
    </button>
  );
}
