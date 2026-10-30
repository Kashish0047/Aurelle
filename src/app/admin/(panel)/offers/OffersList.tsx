"use client";

import { SortableList } from "@/components/admin/ui/SortableList";
import { cn } from "@/lib/cn";

export type OfferStatus = "live" | "scheduled" | "ended" | "off";

export interface OfferRow {
  id: string;
  title: string;
  discount_text: string;
  code: string;
  image_url: string | null;
  is_active: boolean;
  /** Pre-formatted in the salon's timezone. */
  when: string;
  /** From the dates only; the Active switch is applied on top (so toggling updates the badge instantly). */
  status: Exclude<OfferStatus, "off">;
}

const BADGE: Record<OfferStatus, { label: string; className: string }> = {
  live: { label: "Live now", className: "bg-emerald-100 text-emerald-900" },
  scheduled: { label: "Scheduled", className: "bg-amber-100 text-amber-900" },
  ended: { label: "Ended", className: "bg-bg-alt text-muted" },
  off: { label: "Off", className: "bg-bg-alt text-muted" },
};

export function StatusBadge({ status }: { status: OfferStatus }) {
  const b = BADGE[status];
  return <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap", b.className)}>{b.label}</span>;
}

export function OffersList({ rows }: { rows: OfferRow[] }) {
  return (
    <SortableList
      rows={rows}
      table="offers"
      itemName="offer"
      title={(r) => r.title}
      subtitle={(r) => [r.discount_text, r.code && `Code ${r.code}`, r.when].filter(Boolean).join(" · ")}
      thumbnail={(r) => r.image_url ?? ""}
      columns={[
        { header: "Status", cell: (r) => <StatusBadge status={r.is_active || r.status === "ended" ? r.status : "off"} /> },
        { header: "Title", cell: () => null, sortValue: (r) => r.title.toLowerCase(), sortOnly: true },
      ]}
      searchText={(r) => `${r.title} ${r.code} ${r.discount_text}`}
      editHref={(r) => `/admin/offers/${r.id}`}
      publishKey="is_active"
      publishLabels={{ on: "Active", off: "Off" }}
      filters={[
        { label: "Live now", match: (r) => r.is_active && r.status === "live" },
        { label: "Scheduled", match: (r) => r.is_active && r.status === "scheduled" },
        { label: "Ended", match: (r) => r.status === "ended" },
      ]}
      empty={{
        title: "No offers yet",
        text: "Add a festive deal or a limited-time discount. It appears as a banner on your website and disappears when it ends.",
        actionLabel: "Add your first offer",
        actionHref: "/admin/offers/new",
      }}
    />
  );
}
