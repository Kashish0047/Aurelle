import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";

/** Every page inside the panel is admin-only — checked here on the server, not just in the proxy. */
export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAdmin();
  return <AdminShell email={user.email ?? ""}>{children}</AdminShell>;
}
