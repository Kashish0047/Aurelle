import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { uuid } from "@/lib/admin/fields";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { serviceNameSuggestions } from "../services";
import { TestimonialForm } from "../TestimonialForm";

export const metadata: Metadata = { title: "Edit review" };

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const session = await requireAdmin();
  const { data: t } = await session.supabase.from("testimonials").select("*").eq("id", id).maybeSingle();
  if (!t) notFound();
  return (
    <>
      <PageHeader title={t.name} back={{ href: "/admin/testimonials", label: "Testimonials" }} />
      <TestimonialForm
        id={id}
        services={await serviceNameSuggestions(session)}
        defaults={{
          name: t.name,
          location: t.location,
          service: t.service,
          text: t.text,
          rating: t.rating,
          photo_url: t.photo_url ?? "",
          is_published: t.is_published,
        }}
      />
    </>
  );
}
