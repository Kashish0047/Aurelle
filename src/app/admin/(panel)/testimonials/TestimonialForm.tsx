"use client";

import { ContentForm, type FormSectionDef } from "@/components/admin/ui/ContentForm";
import { testimonialSchema, type TestimonialValues } from "@/lib/admin/schemas/content";
import { saveTestimonial } from "./actions";

const sections = (services: string[]): FormSectionDef[] => [
  {
    title: "The review",
    fields: [
      { type: "textarea", name: "text", label: "What they said", max: 800, rows: 5 },
      { type: "rating", name: "rating", label: "Stars" },
    ],
  },
  {
    title: "About the client",
    fields: [
      { type: "text", name: "name", label: "Name", placeholder: "Priya S." },
      { type: "text", name: "location", label: "Area (optional)", placeholder: "Bandra" },
      { type: "text", name: "service", label: "Service they had (optional)", suggestions: services },
      {
        type: "image",
        name: "photo_url",
        label: "Photo (optional)",
        hint: "Only with the client's permission. Without a photo, their initials are shown.",
        folder: "testimonials",
        aspect: "aspect-square",
      },
      { type: "toggle", name: "is_published", label: "Show on website" },
    ],
  },
];

export function TestimonialForm({ id, defaults, services }: { id: string | null; defaults: TestimonialValues; services: string[] }) {
  return (
    <ContentForm
      schema={testimonialSchema}
      defaults={defaults}
      sections={sections(services)}
      save={(v) => saveTestimonial(id, v)}
      success={id ? "Review saved" : "Review added"}
      listHref="/admin/testimonials"
    />
  );
}
