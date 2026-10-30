import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader, PrimaryLink } from "@/components/admin/ui/PageHeader";
import { CategoriesList } from "./CategoriesList";

export const metadata: Metadata = { title: "Service categories" };

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: categories }, { data: services }] = await Promise.all([
    supabase.from("service_categories").select("id, name, slug").order("sort_order"),
    supabase.from("services").select("category_id"),
  ]);
  const counts = new Map<string, number>();
  (services ?? []).forEach((s) => counts.set(s.category_id, (counts.get(s.category_id) ?? 0) + 1));

  return (
    <>
      <PageHeader
        title="Categories"
        description="The filter buttons above your services. A category can only be deleted once it has no services."
        back={{ href: "/admin/services", label: "Services" }}
        actions={<PrimaryLink href="/admin/services/categories/new">+ Add category</PrimaryLink>}
      />
      <CategoriesList rows={(categories ?? []).map((c) => ({ ...c, serviceCount: counts.get(c.id) ?? 0 }))} />
    </>
  );
}
