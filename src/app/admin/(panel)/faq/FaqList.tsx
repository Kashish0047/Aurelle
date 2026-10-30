"use client";

import { SortableList } from "@/components/admin/ui/SortableList";

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  is_published: boolean;
}

export function FaqList({ rows }: { rows: FaqRow[] }) {
  return (
    <SortableList
      rows={rows}
      table="faqs"
      itemName="question"
      title={(r) => r.question}
      subtitle={(r) => (r.answer.length > 110 ? `${r.answer.slice(0, 110)}…` : r.answer)}
      searchText={(r) => `${r.question} ${r.answer}`}
      editHref={(r) => `/admin/faq/${r.id}`}
      publishKey="is_published"
      empty={{
        title: "No questions yet",
        text: "Answer what clients ask most (parking, payment, cancellations) so they book with confidence.",
        actionLabel: "Add your first question",
        actionHref: "/admin/faq/new",
      }}
    />
  );
}
