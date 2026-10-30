import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { FaqForm } from "../FaqForm";

export const metadata: Metadata = { title: "Add question" };

export default async function NewFaqPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Add question" back={{ href: "/admin/faq", label: "FAQ" }} />
      <FaqForm id={null} defaults={{ question: "", answer: "", is_published: true }} />
    </>
  );
}
