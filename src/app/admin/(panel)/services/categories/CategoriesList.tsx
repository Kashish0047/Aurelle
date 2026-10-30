"use client";

import { SortableList } from "@/components/admin/ui/SortableList";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  serviceCount: number;
}

export function CategoriesList({ rows }: { rows: CategoryRow[] }) {
  return (
    <SortableList
      rows={rows}
      table="service_categories"
      itemName="category"
      title={(r) => r.name}
      columns={[{ header: "Services", cell: (r) => r.serviceCount, sortValue: (r) => r.serviceCount }]}
      searchText={(r) => r.name}
      editHref={(r) => `/admin/services/categories/${r.id}`}
      empty={{
        title: "No categories yet",
        text: "Categories group your services (Hair, Skin, Nails…) and become the filter buttons on your website.",
        actionLabel: "Add your first category",
        actionHref: "/admin/services/categories/new",
      }}
    />
  );
}
