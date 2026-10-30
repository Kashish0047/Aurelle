import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader, PrimaryLink } from "@/components/admin/ui/PageHeader";
import { TeamList, type TeamRow } from "./TeamList";

export const metadata: Metadata = { title: "Team" };

export default async function AdminTeamPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("team_members").select("id, name, role, specialty, photo_url, is_published").order("sort_order");
  return (
    <>
      <PageHeader
        title="Team"
        description="The people behind the chair, in the order they appear on your website."
        actions={<PrimaryLink href="/admin/team/new">+ Add team member</PrimaryLink>}
      />
      <TeamList rows={(data ?? []) as TeamRow[]} />
    </>
  );
}
