import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { PackageForm } from "../PackageForm";

export const metadata: Metadata = { title: "Add package" };

export default async function NewPackagePage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Add package" back={{ href: "/admin/packages", label: "Packages" }} />
      <PackageForm
        id={null}
        defaults={{
          name: "",
          tagline: "",
          description: "",
          price: 0,
          price_from: false,
          price_note: "",
          features: [{ value: "" }],
          cta_label: "Enquire",
          image_url: "",
          is_highlighted: false,
          is_published: true,
        }}
      />
    </>
  );
}
