"use client";

import { useSyncExternalStore } from "react";

export interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

/** One shared 1-second clock for every countdown on the page. */
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  timer ??= setInterval(() => listeners.forEach((l) => l()), 1000);
  return () => {
    listeners.delete(listener);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/** Whole seconds, so the snapshot only changes once per tick. */
const nowSeconds = () => Math.floor(Date.now() / 1000);

/**
 * Live time left until `isoDate`. Returns null during SSR / hydration (so the server
 * and first client render match), then updates every second.
 */
export function useCountdown(isoDate: string): Remaining | null {
  const now = useSyncExternalStore(subscribe, nowSeconds, () => null);
  if (now === null) return null;
  const diff = Math.max(0, Math.floor(new Date(isoDate).getTime() / 1000) - now);
  return {
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
    done: diff === 0,
  };
}

/**
 * True once `isoDate` has passed (null during SSR). Its value changes at most once, so a
 * component using it doesn't re-render every second like one using useCountdown.
 */
export function useHasEnded(isoDate: string): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => Date.now() >= new Date(isoDate).getTime(),
    () => null,
  );
}
