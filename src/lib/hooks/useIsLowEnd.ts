"use client";

import { useSyncExternalStore } from "react";

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

let cached: boolean | null = null;

/** Heuristic, evaluated once per page load. */
function detectLowEnd(): boolean {
  if (cached !== null) return cached;
  const nav = navigator as NavigatorWithHints;
  const fewCores = (nav.hardwareConcurrency ?? 8) <= 4;
  const lowMemory = (nav.deviceMemory ?? 8) <= 4;
  const saveData = nav.connection?.saveData === true;
  const slowNetwork = /(^|-)2g$/.test(nav.connection?.effectiveType ?? "");
  const smallViewport = window.innerWidth < 768;
  // Phones always get the light scene: small screens gain little from glass refraction,
  // and battery/thermals matter more than the extra detail.
  cached = saveData || slowNetwork || lowMemory || fewCores || smallViewport;
  return cached;
}

const noopSubscribe = () => () => {};

/**
 * True on devices that should get the lightweight experience
 * (lite 3D: fewer meshes and a plain material, or the static CSS bloom).
 * Returns `true` on the server so SSR never assumes a powerful device.
 */
export function useIsLowEnd(): boolean {
  return useSyncExternalStore(noopSubscribe, detectLowEnd, () => true);
}
