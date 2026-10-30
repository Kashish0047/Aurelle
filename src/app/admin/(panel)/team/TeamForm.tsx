"use client";

import { ContentForm, type FormSectionDef } from "@/components/admin/ui/ContentForm";
import { teamMemberSchema, type TeamMemberValues } from "@/lib/admin/schemas/content";
import { saveTeamMember } from "./actions";

const sections: FormSectionDef[] = [
  {
    title: "Who they are",
    fields: [
      { type: "text", name: "name", label: "Name", placeholder: "Meera Kapoor" },
      { type: "text", name: "role", label: "Role", placeholder: "Senior Stylist" },
      { type: "text", name: "specialty", label: "Speciality (optional)", placeholder: "Balayage & colour correction" },
      { type: "url", name: "instagram_url", label: "Instagram link (optional)", placeholder: "https://instagram.com/…", hint: "Paste the full profile link." },
    ],
  },
  {
    title: "Photo",
    fields: [
      { type: "image", name: "photo_url", label: "Portrait", hint: "A portrait (taller than wide) looks best.", folder: "team", aspect: "aspect-[3/4]" },
      { type: "text", name: "photo_alt", label: "Photo description", hint: "e.g. “Meera smiling in the salon”." },
      { type: "toggle", name: "is_published", label: "Show on website" },
    ],
  },
];

export function TeamForm({ id, defaults }: { id: string | null; defaults: TeamMemberValues }) {
  return (
    <ContentForm
      schema={teamMemberSchema}
      defaults={defaults}
      sections={sections}
      save={(v) => saveTeamMember(id, v)}
      success={id ? "Team member saved" : "Team member added"}
      listHref="/admin/team"
    />
  );
}
