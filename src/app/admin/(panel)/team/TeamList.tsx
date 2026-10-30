"use client";

import { SortableList } from "@/components/admin/ui/SortableList";

export interface TeamRow {
  id: string;
  name: string;
  role: string;
  specialty: string;
  photo_url: string | null;
  is_published: boolean;
}

export function TeamList({ rows }: { rows: TeamRow[] }) {
  return (
    <SortableList
      rows={rows}
      table="team_members"
      itemName="team member"
      title={(r) => r.name}
      subtitle={(r) => [r.role, r.specialty].filter(Boolean).join(" · ")}
      thumbnail={(r) => r.photo_url ?? ""}
      columns={[{ header: "Name", cell: () => null, sortValue: (r) => r.name.toLowerCase(), sortOnly: true }]}
      searchText={(r) => `${r.name} ${r.role} ${r.specialty}`}
      editHref={(r) => `/admin/team/${r.id}`}
      publishKey="is_published"
      empty={{
        title: "No team members yet",
        text: "Introduce your stylists and artists. Clients love knowing who they'll see.",
        actionLabel: "Add your first team member",
        actionHref: "/admin/team/new",
      }}
    />
  );
}
