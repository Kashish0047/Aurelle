import type { Metadata } from "next";
import { bookingConfig } from "@/config/booking.config";
import { requireAdmin } from "@/lib/admin/auth";
import { isoToLocalInput } from "@/lib/admin/datetime";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { OfferForm } from "../OfferForm";

export const metadata: Metadata = { title: "Add offer" };

export default async function NewOfferPage() {
  await requireAdmin();
  const tz = bookingConfig.timezone;
  const now = new Date();
  // Default: starts now, runs for a week, ending at 23:59 salon time.
  const start = isoToLocalInput(now.toISOString(), tz);
  const end = `${isoToLocalInput(new Date(now.getTime() + 7 * 86_400_000).toISOString(), tz).slice(0, 10)}T23:59`;
  return (
    <>
      <PageHeader title="Add offer" back={{ href: "/admin/offers", label: "Offers & Banners" }} />
      <OfferForm
        id={null}
        timeZone={tz}
        defaults={{
          title: "",
          subtitle: "",
          discount_text: "",
          code: "",
          cta_label: "Book now",
          cta_link: "#booking",
          image_url: "",
          start_date: start,
          end_date: end,
          is_active: true,
          show_countdown: true,
        }}
      />
    </>
  );
}
