"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import type { ImageAsset } from "@/config/types";
import { cn } from "@/lib/cn";

interface Props {
  before: ImageAsset;
  after: ImageAsset;
  labels: { before: string; after: string; compare: string };
  sizes: string;
  className?: string;
}

/**
 * Before/after comparison. Drag anywhere on the image (mouse or touch), or focus the handle
 * and use ← → / Home / End. The "after" photo is revealed with clip-path (no layout work).
 * `touch-pan-y` keeps vertical page scrolling working on phones while dragging sideways.
 */
export function BeforeAfter({ before, after, labels, sizes, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const setFromPointer = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromPointer(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) setFromPointer(e.clientX);
  };
  const onPointerUp = () => void (dragging.current = false);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 5;
    const next =
      e.key === "ArrowLeft" ? pos - step
      : e.key === "ArrowRight" ? pos + step
      : e.key === "Home" ? 0
      : e.key === "End" ? 100
      : null;
    if (next === null) return;
    e.preventDefault();
    setPos(Math.min(100, Math.max(0, next)));
  };

  return (
    <div
      ref={ref}
      className={cn("relative cursor-ew-resize touch-pan-y select-none overflow-hidden", className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      data-cursor="⇆"
    >
      <Image src={before.src} alt={before.alt} fill sizes={sizes} className="object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <Image src={after.src} alt={after.alt} fill sizes={sizes} className="object-cover" draggable={false} />
      </div>

      <span className="absolute left-4 top-4 rounded-full bg-surface/85 px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] backdrop-blur">
        {labels.before}
      </span>
      <span className="absolute right-4 top-4 rounded-full bg-surface/85 px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] backdrop-blur">
        {labels.after}
      </span>

      {/* Divider + handle (the focusable slider) */}
      <div className="pointer-events-none absolute inset-y-0 w-px bg-surface" style={{ left: `${pos}%` }}>
        <div
          role="slider"
          tabIndex={0}
          aria-label={labels.compare}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={onKeyDown}
          className="pointer-events-auto absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-surface text-ink shadow-lg"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
