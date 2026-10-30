import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { TeamForm } from "../TeamForm";

export const metadata: Metadata = { title: "Add team member" };

export default async function NewTeamMemberPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Add team member" back={{ href: "/admin/team", label: "Team" }} />
      <TeamForm id={null} defaults={{ name: "", role: "", specialty: "", photo_url: "", photo_alt: "", instagram_url: "", is_published: true }} />
    </>
  );
}
