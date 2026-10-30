import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader, PrimaryLink, SecondaryLink } from "@/components/admin/ui/PageHeader";
import { ServicesList, type ServiceRow } from "./ServicesList";

export const metadata: Metadata = { title: "Services" };

export default async function AdminServicesPage() {
  const { supabase } = await requireAdmin();
  const [services, categories] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, slug, category_id, price, price_from, duration_min, image_url, is_popular, is_published")
      .order("sort_order"),
    supabase.from("service_categories").select("id, name").order("sort_order"),
  ]);

  return (
    <>
      <PageHeader
        title="Services"
        description="Your treatments, prices and durations. Drag to change the order they appear on your website."
        actions={
          <>
            <SecondaryLink href="/admin/services/categories">Manage categories</SecondaryLink>
            <PrimaryLink href="/admin/services/new">+ Add service</PrimaryLink>
          </>
        }
      />
      <ServicesList rows={(services.data ?? []) as ServiceRow[]} categories={categories.data ?? []} />
    </>
  );
}
