import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { CategoryForm } from "../CategoryForm";

export const metadata: Metadata = { title: "Add category" };

export default async function NewCategoryPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Add category" back={{ href: "/admin/services/categories", label: "Categories" }} />
      <CategoryForm id={null} defaults={{ name: "", slug: "" }} />
    </>
  );
}
