import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { serviceNameSuggestions } from "../services";
import { TestimonialForm } from "../TestimonialForm";

export const metadata: Metadata = { title: "Add review" };

export default async function NewTestimonialPage() {
  const session = await requireAdmin();
  return (
    <>
      <PageHeader title="Add review" back={{ href: "/admin/testimonials", label: "Testimonials" }} />
      <TestimonialForm
        id={null}
        services={await serviceNameSuggestions(session)}
        defaults={{ name: "", location: "", service: "", text: "", rating: 5, photo_url: "", is_published: true }}
      />
    </>
  );
}
