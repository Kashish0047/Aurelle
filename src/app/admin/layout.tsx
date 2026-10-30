import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site.config";

/** Admin pages are always rendered per request (auth + live data) — never pre-rendered or cached. */
export const dynamic = "force-dynamic";

/** Everything under /admin: never indexed, never cached by search engines. */
export const metadata: Metadata = {
  title: { default: `Admin · ${siteConfig.name}`, template: `%s · Admin · ${siteConfig.name}` },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
