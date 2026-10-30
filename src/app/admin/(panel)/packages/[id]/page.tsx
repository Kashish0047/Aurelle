import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { uuid } from "@/lib/admin/fields";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { PackageForm } from "../PackageForm";

export const metadata: Metadata = { title: "Edit package" };

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const { supabase } = await requireAdmin();
  const { data: p } = await supabase.from("packages").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();
  return (
    <>
      <PageHeader title={p.name} back={{ href: "/admin/packages", label: "Packages" }} />
      <PackageForm
        id={id}
        defaults={{
          name: p.name,
          tagline: p.tagline,
          description: p.description,
          price: p.price,
          price_from: p.price_from,
          price_note: p.price_note,
          features: (p.features as string[]).map((value) => ({ value })),
          cta_label: p.cta_label,
          image_url: p.image_url ?? "",
          is_highlighted: p.is_highlighted,
          is_published: p.is_published,
        }}
      />
    </>
  );
}
