import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader, SecondaryLink } from "@/components/admin/ui/PageHeader";
import { GalleryList, type GalleryRow } from "./GalleryList";
import { GalleryUploader } from "./GalleryUploader";

export const metadata: Metadata = { title: "Recent Work" };

export default async function AdminGalleryPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const highlight = Boolean((await searchParams).new);
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("gallery_items")
    .select("id, title, category, image_url, before_image_url, size, is_published")
    .order("sort_order");
  return (
    <>
      <PageHeader
        title="Recent Work"
        description="Your lookbook. Drag to change the order; the first photos appear first on the website."
        actions={<SecondaryLink href="/admin/gallery/new">+ Before / after pair</SecondaryLink>}
      />
      <GalleryUploader highlight={highlight} />
      <GalleryList rows={(data ?? []) as GalleryRow[]} />
    </>
  );
}
