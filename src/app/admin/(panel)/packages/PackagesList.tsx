"use client";

import { formatPrice } from "@/lib/format";
import { SortableList } from "@/components/admin/ui/SortableList";

export interface PackageRow {
  id: string;
  name: string;
  tagline: string;
  price: number;
  price_from: boolean;
  is_highlighted: boolean;
  is_published: boolean;
  image_url: string | null;
}

export function PackagesList({ rows }: { rows: PackageRow[] }) {
  return (
    <SortableList
      rows={rows}
      table="packages"
      itemName="package"
      title={(r) => r.name}
      subtitle={(r) => `${r.tagline}${r.is_highlighted ? " · Featured" : ""}`}
      thumbnail={(r) => r.image_url ?? ""}
      columns={[
        { header: "Price", cell: (r) => formatPrice(r.price, r.price_from), sortValue: (r) => r.price },
        { header: "Name", cell: () => null, sortValue: (r) => r.name.toLowerCase(), sortOnly: true },
      ]}
      searchText={(r) => `${r.name} ${r.tagline}`}
      editHref={(r) => `/admin/packages/${r.id}`}
      publishKey="is_published"
      empty={{
        title: "No packages yet",
        text: "Bundle services into bridal or spa packages. Your website shows them as price cards.",
        actionLabel: "Add your first package",
        actionHref: "/admin/packages/new",
      }}
    />
  );
}
