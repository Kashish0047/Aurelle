import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { uuid } from "@/lib/admin/fields";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { galleryCategorySuggestions } from "../categories";
import { GalleryForm } from "../GalleryForm";

export const metadata: Metadata = { title: "Edit photo" };

export default async function EditGalleryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const session = await requireAdmin();
  const { data: g } = await session.supabase.from("gallery_items").select("*").eq("id", id).maybeSingle();
  if (!g) notFound();
  return (
    <>
      <PageHeader title={g.title || "Edit photo"} back={{ href: "/admin/gallery", label: "Recent Work" }} />
      <GalleryForm
        id={id}
        categories={await galleryCategorySuggestions(session)}
        defaults={{
          title: g.title,
          category: g.category,
          size: g.size,
          image_url: g.image_url,
          image_alt: g.image_alt,
          before_image_url: g.before_image_url ?? "",
          is_published: g.is_published,
        }}
      />
    </>
  );
}
