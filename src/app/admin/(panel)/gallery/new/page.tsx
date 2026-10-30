import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { galleryCategorySuggestions } from "../categories";
import { GalleryForm } from "../GalleryForm";

export const metadata: Metadata = { title: "Add photo" };

export default async function NewGalleryItemPage() {
  const session = await requireAdmin();
  return (
    <>
      <PageHeader
        title="Add photo"
        description="For a before/after slider, upload both photos. For plain photos, the drop box on Recent Work is quicker."
        back={{ href: "/admin/gallery", label: "Recent Work" }}
      />
      <GalleryForm
        id={null}
        categories={await galleryCategorySuggestions(session)}
        defaults={{ title: "", category: "", size: "wide", image_url: "", image_alt: "", before_image_url: "", is_published: true }}
      />
    </>
  );
}
