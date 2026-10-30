"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useHasFinePointer } from "@/lib/hooks/useMediaQuery";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

const INTERACTIVE = 'a, button, [role="button"], label, summary, [data-cursor]';

/**
 * Two-part cursor: a precise dot plus a lagging ring.
 * - Ring grows over links/buttons.
 * - Elements with `data-cursor="View"` turn the ring into a filled bubble with that label.
 * Only mounted on fine-pointer devices without reduced motion; touch users never see it.
 */
export function CustomCursor() {
  const finePointer = useHasFinePointer();
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!enabled || !dot || !ring || !label) return;

    const html = document.documentElement;
    html.classList.add("has-custom-cursor");
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, autoAlpha: 0 });

    // quickTo = one reusable tween per axis; far cheaper than creating tweens on every mousemove.
    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3.out" });

    let visible = false;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!visible) {
        visible = true;
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    // Hover states: ring expands over interactive elements, becomes a labelled bubble for data-cursor.
    const onOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>(INTERACTIVE);
      const text = target?.dataset.cursor ?? "";
      label.textContent = text;
      gsap.to(ring, {
        width: text ? 88 : target ? 56 : 36,
        height: text ? 88 : target ? 56 : 36,
        backgroundColor: text ? "var(--accent)" : "rgba(0,0,0,0)",
        borderColor: text ? "var(--accent)" : "var(--text)",
        duration: 0.45,
        ease: "expo.out",
      });
      gsap.to(label, { autoAlpha: text ? 1 : 0, duration: 0.25 });
      gsap.to(dot, { scale: target ? 0 : 1, duration: 0.3 });
    };

    const onLeave = () => {
      visible = false;
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.3 });
    };
    const onDown = () => gsap.to(ring, { scale: 0.85, duration: 0.2 });
    const onUp = () => gsap.to(ring, { scale: 1, duration: 0.35, ease: "back.out(2)" });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      html.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[130]">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 flex size-9 items-center justify-center rounded-full border border-ink will-change-transform"
      >
        <span
          ref={labelRef}
          className="invisible text-[0.7rem] font-medium uppercase tracking-[0.18em] text-accent-contrast opacity-0"
        />
      </div>
      <div ref={dotRef} className="absolute left-0 top-0 size-1.5 rounded-full bg-accent will-change-transform" />
    </div>
  );
}
