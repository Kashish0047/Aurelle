import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { uuid } from "@/lib/admin/fields";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { CategoryForm } from "../CategoryForm";

export const metadata: Metadata = { title: "Edit category" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const { supabase } = await requireAdmin();
  const { data: c } = await supabase.from("service_categories").select("name, slug").eq("id", id).maybeSingle();
  if (!c) notFound();
  return (
    <>
      <PageHeader title={c.name} back={{ href: "/admin/services/categories", label: "Categories" }} />
      <CategoryForm id={id} defaults={{ name: c.name, slug: c.slug }} />
    </>
  );
}
