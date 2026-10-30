"use client";

import { SortableList } from "@/components/admin/ui/SortableList";

export interface GalleryRow {
  id: string;
  title: string;
  category: string;
  image_url: string;
  before_image_url: string | null;
  size: "tall" | "square" | "wide";
  is_published: boolean;
}

const SIZE_LABEL = { tall: "Tall", square: "Square", wide: "Wide" } as const;

export function GalleryList({ rows }: { rows: GalleryRow[] }) {
  const categories = [...new Set(rows.map((r) => r.category).filter(Boolean))];
  return (
    <SortableList
      rows={rows}
      table="gallery_items"
      itemName="photo"
      title={(r) => r.title || "Untitled photo"}
      subtitle={(r) => [r.category, SIZE_LABEL[r.size], r.before_image_url && "Before / after"].filter(Boolean).join(" · ")}
      thumbnail={(r) => r.image_url}
      searchText={(r) => `${r.title} ${r.category}`}
      editHref={(r) => `/admin/gallery/${r.id}`}
      publishKey="is_published"
      filters={[
        { label: "Before / after", match: (r) => !!r.before_image_url },
        ...categories.map((c) => ({ label: c, match: (r: GalleryRow) => r.category === c })),
      ]}
      empty={{
        title: "No photos yet",
        text: "Show off your best work. Drop a few photos in the box above to start your lookbook.",
        actionLabel: "Add a before/after pair",
        actionHref: "/admin/gallery/new",
      }}
    />
  );
}
