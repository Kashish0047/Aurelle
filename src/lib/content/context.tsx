"use client";

import { createContext, useContext, type ReactNode } from "react";
import { configContent } from "./defaults";
import type { SiteContent } from "./types";

/** Defaults to the config files, so a component rendered outside the provider still works. */
const SiteContentContext = createContext<SiteContent>(configContent());

/** Wraps the public site with the content resolved on the server (database or config). */
export function SiteContentProvider({ value, children }: { value: SiteContent; children: ReactNode }) {
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

/** The website's content in client components: services, team, settings… */
export function useSiteContent(): SiteContent {
  return useContext(SiteContentContext);
}
