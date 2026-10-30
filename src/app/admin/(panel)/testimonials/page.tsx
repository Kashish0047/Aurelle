import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader, PrimaryLink } from "@/components/admin/ui/PageHeader";
import { TestimonialsList, type TestimonialRow } from "./TestimonialsList";

export const metadata: Metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("testimonials")
    .select("id, name, location, service, text, rating, photo_url, is_published")
    .order("sort_order");
  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Reviews from happy clients, shown in a slider on your website."
        actions={<PrimaryLink href="/admin/testimonials/new">+ Add review</PrimaryLink>}
      />
      <TestimonialsList rows={(data ?? []) as TestimonialRow[]} />
    </>
  );
}
