"use server";

import { CONTENT_TAGS } from "@/lib/content-tags";
import type { ActionResult } from "@/lib/admin/result";
import { teamMemberSchema } from "@/lib/admin/schemas/content";
import { saveRow } from "@/lib/admin/server";

/** Create (id = null) or update a team member. */
export async function saveTeamMember(id: string | null, input: unknown): Promise<ActionResult> {
  return saveRow({
    table: "team_members",
    id,
    schema: teamMemberSchema,
    input,
    imageColumns: ["photo_url"],
    refresh: { tags: [CONTENT_TAGS.team], paths: ["/admin/team", "/admin"] },
  });
}
