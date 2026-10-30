import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader, PrimaryLink } from "@/components/admin/ui/PageHeader";
import { FaqList, type FaqRow } from "./FaqList";

export const metadata: Metadata = { title: "FAQ" };

export default async function AdminFaqPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("faqs").select("id, question, answer, is_published").order("sort_order");
  return (
    <>
      <PageHeader
        title="FAQ"
        description="Common questions, shown as an accordion on your website (and to Google as rich results)."
        actions={<PrimaryLink href="/admin/faq/new">+ Add question</PrimaryLink>}
      />
      <FaqList rows={(data ?? []) as FaqRow[]} />
    </>
  );
}
