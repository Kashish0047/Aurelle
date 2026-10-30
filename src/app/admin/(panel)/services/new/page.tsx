import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ServiceForm } from "../ServiceForm";

export const metadata: Metadata = { title: "Add service" };

export default async function NewServicePage() {
  const { supabase } = await requireAdmin();
  const { data: categories } = await supabase.from("service_categories").select("id, name").order("sort_order");

  return (
    <>
      <PageHeader title="Add service" back={{ href: "/admin/services", label: "Services" }} />
      <ServiceForm
        id={null}
        categories={categories ?? []}
        defaults={{
          name: "",
          slug: "",
          category_id: categories?.[0]?.id ?? "",
          description: "",
          price: 0,
          price_from: false,
          duration_min: 60,
          image_url: "",
          image_alt: "",
          is_popular: false,
          is_published: true,
        }}
      />
    </>
  );
}
