import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { uuid } from "@/lib/admin/fields";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { TeamForm } from "../TeamForm";

export const metadata: Metadata = { title: "Edit team member" };

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const { supabase } = await requireAdmin();
  const { data: m } = await supabase.from("team_members").select("*").eq("id", id).maybeSingle();
  if (!m) notFound();
  return (
    <>
      <PageHeader title={m.name} back={{ href: "/admin/team", label: "Team" }} />
      <TeamForm
        id={id}
        defaults={{
          name: m.name,
          role: m.role,
          specialty: m.specialty,
          photo_url: m.photo_url ?? "",
          photo_alt: m.photo_alt,
          instagram_url: m.instagram_url,
          is_published: m.is_published,
        }}
      />
    </>
  );
}
