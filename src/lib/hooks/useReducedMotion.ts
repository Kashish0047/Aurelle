"use client";

import { useMediaQuery } from "./useMediaQuery";

/**
 * True when the visitor asked their OS to minimise motion.
 * Every animated component checks this: 3D stays still, scroll scenes don't pin/scrub,
 * and content is shown immediately in its final state.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
