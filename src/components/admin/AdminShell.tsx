"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/login/actions";
import { cn } from "@/lib/cn";
import { Wordmark } from "@/components/ui/Wordmark";
import { ADMIN_NAV } from "./nav";
import { ToastProvider } from "./Toaster";
import { ConfirmProvider } from "./ui/ConfirmDialog";

function NavIcon({ d }: { d: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

/**
 * Admin frame: sidebar (a slide-in drawer on phones), top bar with the signed-in email and
 * Logout, and the toast provider. Plain, fast and fully usable on a phone.
 */
export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer with Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-1 p-3">
      {ADMIN_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
            isActive(item.href) ? "bg-ink text-bg" : "text-ink/80 hover:bg-bg-alt",
          )}
        >
          <NavIcon d={item.icon} />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <ToastProvider>
      <ConfirmProvider>
      <div className="min-h-dvh bg-bg-alt">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
          <Link href="/admin" className="px-6 py-5">
            <Wordmark />
          </Link>
          {nav}
        </aside>

        {/* Phone drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-surface shadow-xl">
              <div className="px-6 py-5">
                <Wordmark />
              </div>
              {nav}
            </aside>
          </div>
        )}

        <div className="lg:pl-64">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur md:px-8">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="grid size-10 place-items-center rounded-full border border-line lg:hidden"
            >
              <NavIcon d="M4 7h16M4 12h16M4 17h16" />
            </button>
            <p className="truncate text-sm text-muted" title={email}>
              {email}
            </p>
            <form action={logout}>
              <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm transition-colors hover:bg-ink hover:text-bg">
                Log out
              </button>
            </form>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">{children}</main>
        </div>
      </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
