import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader, PrimaryLink } from "@/components/admin/ui/PageHeader";
import { PackagesList, type PackageRow } from "./PackagesList";

export const metadata: Metadata = { title: "Packages" };

export default async function AdminPackagesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("packages")
    .select("id, name, tagline, price, price_from, is_highlighted, is_published, image_url")
    .order("sort_order");
  return (
    <>
      <PageHeader
        title="Packages"
        description="Bridal and spa bundles. The featured package is shown as the dark middle card."
        actions={<PrimaryLink href="/admin/packages/new">+ Add package</PrimaryLink>}
      />
      <PackagesList rows={(data ?? []) as PackageRow[]} />
    </>
  );
}
