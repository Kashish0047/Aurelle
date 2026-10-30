import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { uuid } from "@/lib/admin/fields";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ServiceForm } from "../ServiceForm";

export const metadata: Metadata = { title: "Edit service" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const { supabase } = await requireAdmin();
  const [{ data: s }, { data: categories }] = await Promise.all([
    supabase.from("services").select("*").eq("id", id).maybeSingle(),
    supabase.from("service_categories").select("id, name").order("sort_order"),
  ]);
  if (!s) notFound();

  return (
    <>
      <PageHeader title={s.name} back={{ href: "/admin/services", label: "Services" }} />
      <ServiceForm
        id={id}
        categories={categories ?? []}
        defaults={{
          name: s.name,
          slug: s.slug,
          category_id: s.category_id,
          description: s.description,
          price: s.price,
          price_from: s.price_from,
          duration_min: s.duration_min,
          image_url: s.image_url ?? "",
          image_alt: s.image_alt,
          is_popular: s.is_popular,
          is_published: s.is_published,
        }}
      />
    </>
  );
}
