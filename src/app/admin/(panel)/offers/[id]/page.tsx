import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bookingConfig } from "@/config/booking.config";
import { requireAdmin } from "@/lib/admin/auth";
import { isoToLocalInput } from "@/lib/admin/datetime";
import { uuid } from "@/lib/admin/fields";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { OfferForm } from "../OfferForm";

export const metadata: Metadata = { title: "Edit offer" };

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const { supabase } = await requireAdmin();
  const { data: o } = await supabase.from("offers").select("*").eq("id", id).maybeSingle();
  if (!o) notFound();
  const tz = bookingConfig.timezone;
  return (
    <>
      <PageHeader title={o.title} back={{ href: "/admin/offers", label: "Offers & Banners" }} />
      <OfferForm
        id={id}
        timeZone={tz}
        defaults={{
          title: o.title,
          subtitle: o.subtitle,
          discount_text: o.discount_text,
          code: o.code,
          cta_label: o.cta_label,
          cta_link: o.cta_link,
          image_url: o.image_url ?? "",
          start_date: isoToLocalInput(o.start_date, tz),
          end_date: isoToLocalInput(o.end_date, tz),
          is_active: o.is_active,
          show_countdown: o.show_countdown,
        }}
      />
    </>
  );
}
