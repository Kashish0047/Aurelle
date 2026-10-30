"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Becomes true (and stays true) once the element comes within `margin` of the viewport.
 * Used to defer mounting heavy things like a second WebGL canvas until they're about to be seen.
 */
export function useNearViewport(ref: RefObject<HTMLElement | null>, margin = "100% 0px"): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true);
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, near]);

  return near;
}
