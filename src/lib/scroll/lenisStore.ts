import type Lenis from "lenis";

/**
 * Tiny external store holding the active Lenis instance, so any component can
 * read it via useSyncExternalStore without prop drilling or context re-renders.
 */
let current: Lenis | null = null;
const listeners = new Set<() => void>();

export const lenisStore = {
  get: () => current,
  set(instance: Lenis | null) {
    current = instance;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
