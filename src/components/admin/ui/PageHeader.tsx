import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  /** Optional "back" link shown above the title. */
  back?: { href: string; label: string };
  actions?: ReactNode;
}

/** Title row for every admin page. */
export function PageHeader({ title, description, back, actions }: Props) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back && (
          <Link href={back.href} className="link-underline mb-2 inline-block text-sm text-muted">
            ← {back.label}
          </Link>
        )}
        <h1 className="font-serif text-4xl">{title}</h1>
        {description && <p className="mt-1 max-w-xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="rounded-full bg-ink px-5 py-2.5 text-sm text-bg transition-opacity hover:opacity-90">
      {children}
    </Link>
  );
}

export function SecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm transition-colors hover:border-ink/40">
      {children}
    </Link>
  );
}
