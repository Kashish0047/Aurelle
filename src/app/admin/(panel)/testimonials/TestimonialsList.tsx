"use client";

import { SortableList } from "@/components/admin/ui/SortableList";

export interface TestimonialRow {
  id: string;
  name: string;
  location: string;
  service: string;
  text: string;
  rating: number;
  photo_url: string | null;
  is_published: boolean;
}

export function TestimonialsList({ rows }: { rows: TestimonialRow[] }) {
  return (
    <SortableList
      rows={rows}
      table="testimonials"
      itemName="review"
      title={(r) => r.name}
      subtitle={(r) => (r.text.length > 90 ? `“${r.text.slice(0, 90)}…”` : `“${r.text}”`)}
      thumbnail={(r) => r.photo_url ?? ""}
      columns={[
        {
          header: "Stars",
          cell: (r) => (
            <span className="whitespace-nowrap text-gold" aria-label={`${r.rating} out of 5 stars`}>
              {"★".repeat(r.rating)}
              <span className="text-line">{"★".repeat(5 - r.rating)}</span>
            </span>
          ),
          sortValue: (r) => r.rating,
        },
        { header: "Name", cell: () => null, sortValue: (r) => r.name.toLowerCase(), sortOnly: true },
      ]}
      searchText={(r) => `${r.name} ${r.location} ${r.service} ${r.text}`}
      editHref={(r) => `/admin/testimonials/${r.id}`}
      publishKey="is_published"
      empty={{
        title: "No reviews yet",
        text: "Copy your best Google or Instagram reviews here. They appear in the testimonials slider.",
        actionLabel: "Add your first review",
        actionHref: "/admin/testimonials/new",
      }}
    />
  );
}
