import { cn } from "@/lib/cn";

/** Shared input styles (plain functions, usable from server and client components). */
export const inputClass = (invalid?: boolean) =>
  cn(
    "h-11 w-full rounded-xl border bg-surface px-4 text-base outline-none transition-colors placeholder:text-muted/60 focus:border-ink sm:text-sm",
    invalid ? "border-accent" : "border-line",
  );

export const textareaClass = (invalid?: boolean) => cn(inputClass(invalid), "h-auto min-h-28 py-3 leading-relaxed");
