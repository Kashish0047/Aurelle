"use client";

import { useSyncExternalStore } from "react";
import type { BookingConfig } from "@/config/types";
import { getBookableDates } from "./slots";

/**
 * Bookable dates depend on "today", so they're computed in the browser only (once per page
 * load). On the server — where this page is pre-rendered at build time — the list is empty.
 * Used by the date step only, so the switch from empty → filled re-renders just that step.
 */
const NO_DATES: string[] = [];
let cached: { rules: BookingConfig; dates: string[] } | null = null;
const noopSubscribe = () => () => {};

/** `rules`: the live booking rules from useSiteContent(). */
export function useBookableDates(rules: BookingConfig): string[] {
  const getClientDates = () => {
    if (cached?.rules !== rules) cached = { rules, dates: getBookableDates(undefined, rules) };
    return cached.dates;
  };
  return useSyncExternalStore(noopSubscribe, getClientDates, () => NO_DATES);
}
