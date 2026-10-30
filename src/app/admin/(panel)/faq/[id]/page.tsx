import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { uuid } from "@/lib/admin/fields";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { FaqForm } from "../FaqForm";

export const metadata: Metadata = { title: "Edit question" };

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const { supabase } = await requireAdmin();
  const { data: f } = await supabase.from("faqs").select("*").eq("id", id).maybeSingle();
  if (!f) notFound();
  return (
    <>
      <PageHeader title="Edit question" back={{ href: "/admin/faq", label: "FAQ" }} />
      <FaqForm id={id} defaults={{ question: f.question, answer: f.answer, is_published: f.is_published }} />
    </>
  );
}
