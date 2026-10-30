"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export { inputClass, textareaClass } from "./styles";

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  /** Shown at the right of the label, e.g. a character counter. */
  aside?: ReactNode;
}

/** Label + control + hint/error, wired up for screen readers (pass `aria-describedby={describedBy(id, …)}`). */
export function Field({ id, label, hint, error, children, aside }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm">
          {label}
        </label>
        {aside && <span className="text-xs text-muted">{aside}</span>}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-accent">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export const describedBy = (id: string, error?: string, hint?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

/** A titled group of fields. */
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0 rounded-2xl border border-line bg-surface p-5 md:p-6">
      {/* A floated legend sits inside the box instead of on its top border (the browser default). */}
      <legend className="float-left mb-4 w-full font-serif text-xl">{title}</legend>
      <div className="clear-both flex flex-col gap-5">{children}</div>
    </fieldset>
  );
}

/** Sticky save bar at the bottom of every edit page. */
export function SaveBar({ saving, cancelHref, error }: { saving: boolean; cancelHref: string; error?: string | null }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-col gap-2 border-t border-line bg-bg-alt/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
      {error && (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Link href={cancelHref} className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm">
          Cancel
        </Link>
        <button type="submit" disabled={saving} className="rounded-full bg-ink px-6 py-2.5 text-sm text-bg disabled:opacity-60">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
