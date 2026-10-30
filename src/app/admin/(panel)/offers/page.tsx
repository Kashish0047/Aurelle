import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { bookingConfig } from "@/config/booking.config";
import { requireAdmin } from "@/lib/admin/auth";
import { formatInstant, offerPhase } from "@/lib/admin/datetime";
import { PageHeader, PrimaryLink } from "@/components/admin/ui/PageHeader";
import { OffersList, type OfferRow } from "./OffersList";

export const metadata: Metadata = { title: "Offers & Banners" };

export default async function AdminOffersPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  if ((await searchParams).new) redirect("/admin/offers/new");
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("offers")
    .select("id, title, discount_text, code, image_url, is_active, start_date, end_date")
    .order("sort_order");

  const tz = bookingConfig.timezone;
  const rows: OfferRow[] = (data ?? []).map((o) => ({
    id: o.id,
    title: o.title,
    discount_text: o.discount_text,
    code: o.code,
    image_url: o.image_url,
    is_active: o.is_active,
    when: `${formatInstant(o.start_date, tz)} → ${formatInstant(o.end_date, tz)}`,
    status: offerPhase(o.start_date, o.end_date),
  }));

  return (
    <>
      <PageHeader
        title="Offers & Banners"
        description="Limited-time deals shown as a banner on your website. Each one switches on and off by itself on its dates."
        actions={<PrimaryLink href="/admin/offers/new">+ Add offer</PrimaryLink>}
      />
      <OffersList rows={rows} />
    </>
  );
}
