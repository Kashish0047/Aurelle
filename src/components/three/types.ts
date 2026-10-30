import type { RefObject } from "react";

/** "high": smooth geometry + iridescence. "lite": low-poly geometry, no iridescence (low-end devices). */
export type SceneQuality = "high" | "lite";

/** Which choreography the scene follows (see BeautyScene). */
export type SceneMode = "hero" | "services";

/** Mutable inputs written by DOM code (scroll, pointer) and read every frame — never React state. */
export interface SceneInputs {
  /** 0 → 1 scroll progress (hero: leaving the hero; services: through the pinned track) */
  scroll: RefObject<number>;
  /** Normalised pointer position, -1 … 1 on each axis */
  pointer: RefObject<{ x: number; y: number }>;
}
