"use client";

import { useEffect, useRef } from "react";

/**
 * Normalised window pointer position (-1 … 1 per axis, y up) kept in a ref,
 * so 3D scenes can read it every frame without React re-renders.
 * Only listens while `enabled` (pass false on touch devices / reduced motion).
 */
export function usePointerRef(enabled: boolean) {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      pointer.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled]);

  return pointer;
}
