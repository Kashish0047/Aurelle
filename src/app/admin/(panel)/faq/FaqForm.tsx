"use client";

import { ContentForm, type FormSectionDef } from "@/components/admin/ui/ContentForm";
import { faqSchema, type FaqValues } from "@/lib/admin/schemas/content";
import { saveFaq } from "./actions";

const sections: FormSectionDef[] = [
  {
    title: "Question & answer",
    fields: [
      { type: "text", name: "question", label: "Question", placeholder: "Do I need to book in advance?" },
      { type: "textarea", name: "answer", label: "Answer", max: 1500, rows: 6 },
      { type: "toggle", name: "is_published", label: "Show on website" },
    ],
  },
];

export function FaqForm({ id, defaults }: { id: string | null; defaults: FaqValues }) {
  return (
    <ContentForm
      schema={faqSchema}
      defaults={defaults}
      sections={sections}
      save={(v) => saveFaq(id, v)}
      success={id ? "Question saved" : "Question added"}
      listHref="/admin/faq"
    />
  );
}
