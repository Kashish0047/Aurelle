import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Magnetic } from "./Magnetic";

type Variant = "solid" | "accent" | "outline";
type Size = "sm" | "md";

const base =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-sans font-medium tracking-wide whitespace-nowrap isolate transition-colors duration-500 ease-out-expo disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<Size, string> = {
  sm: "h-10 px-5 text-[0.8125rem]",
  md: "h-13 px-7 text-sm",
};

/** Each variant has a resting colour and a fill layer (::before-like span) that slides up on hover. */
const variants: Record<Variant, { root: string; fill: string }> = {
  solid: { root: "bg-ink text-bg hover:text-accent-contrast", fill: "bg-accent" },
  accent: { root: "bg-accent text-accent-contrast hover:text-bg", fill: "bg-ink" },
  outline: { root: "border border-ink/30 text-ink hover:text-bg", fill: "bg-ink" },
};

export function buttonClasses(variant: Variant = "solid", size: Size = "md", className?: string) {
  return cn(base, sizes[size], variants[variant].root, className);
}

/** Hover fill: a rounded layer rising from below the button. Pure CSS, transform-only. */
function Fill({ variant }: { variant: Variant }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute inset-0 -z-10 translate-y-[101%] rounded-[inherit] transition-transform duration-500 ease-out-expo group-hover:translate-y-0 group-focus-visible:translate-y-0",
        variants[variant].fill,
      )}
    />
  );
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  /** Wrap in a magnetic hover effect (desktop only). */
  magnetic?: boolean;
  children: ReactNode;
}

export function ButtonLink({
  variant = "solid",
  size = "md",
  magnetic = false,
  className,
  children,
  ...props
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const el = (
    <a className={buttonClasses(variant, size, className)} {...props}>
      <Fill variant={variant} />
      {children}
    </a>
  );
  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}

export function Button({
  variant = "solid",
  size = "md",
  magnetic = false,
  className,
  children,
  type = "button",
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  const el = (
    <button type={type} className={buttonClasses(variant, size, className)} {...props}>
      <Fill variant={variant} />
      {children}
    </button>
  );
  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}

/** Small diagonal arrow used in CTAs. */
export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={cn("size-3.5 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 12 12 4M5.5 4H12v6.5" />
    </svg>
  );
}
