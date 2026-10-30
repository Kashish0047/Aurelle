"use client";

import { formatDuration, formatPrice } from "@/lib/format";
import { SortableList } from "@/components/admin/ui/SortableList";

export interface ServiceRow {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  price: number;
  price_from: boolean;
  duration_min: number;
  image_url: string | null;
  is_popular: boolean;
  is_published: boolean;
}

export function ServicesList({ rows, categories }: { rows: ServiceRow[]; categories: { id: string; name: string }[] }) {
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  return (
    <SortableList
      rows={rows}
      table="services"
      itemName="service"
      title={(r) => r.name}
      subtitle={(r) => `${categoryName.get(r.category_id) ?? "No category"}${r.is_popular ? " · Popular" : ""}`}
      thumbnail={(r) => r.image_url ?? ""}
      columns={[
        { header: "Price", cell: (r) => formatPrice(r.price, r.price_from), sortValue: (r) => r.price },
        { header: "Time", cell: (r) => formatDuration(r.duration_min), sortValue: (r) => r.duration_min },
        { header: "Name", cell: () => null, sortValue: (r) => r.name.toLowerCase(), sortOnly: true },
      ]}
      searchText={(r) => `${r.name} ${categoryName.get(r.category_id) ?? ""}`}
      editHref={(r) => `/admin/services/${r.id}`}
      publishKey="is_published"
      filters={categories.map((c) => ({ label: c.name, match: (r: ServiceRow) => r.category_id === c.id }))}
      empty={{
        title: "No services yet",
        text: "Add the treatments you offer. They appear on your website and in the booking form.",
        actionLabel: "Add your first service",
        actionHref: "/admin/services/new",
      }}
    />
  );
}
