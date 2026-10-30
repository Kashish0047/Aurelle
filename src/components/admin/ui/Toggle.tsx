"use client";

import { cn } from "@/lib/cn";

interface Props {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  /** Visually hide the label (it stays available to screen readers). */
  hideLabel?: boolean;
  disabled?: boolean;
  description?: string;
}

/** On/off switch (role="switch"), used for Published, Popular, Highlighted… */
export function Toggle({ checked, onChange, label, hideLabel, disabled, description }: Props) {
  return (
    <label className={cn("inline-flex items-center gap-3", disabled ? "opacity-50" : "cursor-pointer")}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300",
          checked ? "bg-ink" : "bg-line",
        )}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden
          className={cn(
            "inline-block size-5 rounded-full bg-surface shadow transition-transform duration-300",
            checked ? "translate-x-5.5" : "translate-x-0.5",
          )}
        />
      </button>
      {!hideLabel && (
        <span className="flex flex-col">
          <span className="text-sm">{label}</span>
          {description && <span className="text-xs text-muted">{description}</span>}
        </span>
      )}
    </label>
  );
}
