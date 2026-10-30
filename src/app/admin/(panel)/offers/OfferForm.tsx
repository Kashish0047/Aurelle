"use client";

import { ContentForm, type FormSectionDef } from "@/components/admin/ui/ContentForm";
import { offerSchema, type OfferValues } from "@/lib/admin/schemas/content";
import { saveOffer } from "./actions";

const sections = (timeZone: string): FormSectionDef[] => [
  {
    title: "What the banner says",
    fields: [
      { type: "text", name: "title", label: "Title", placeholder: "Festive Glow Week" },
      { type: "textarea", name: "subtitle", label: "Description", max: 300, rows: 3, placeholder: "20% off all facials this week only." },
      { type: "text", name: "discount_text", label: "Small label (optional)", placeholder: "20% OFF" },
      { type: "text", name: "code", label: "Promo code (optional)", placeholder: "GLOW20" },
    ],
  },
  {
    title: "Button",
    fields: [
      { type: "text", name: "cta_label", label: "Button text (optional)", placeholder: "Book now" },
      {
        type: "text",
        name: "cta_link",
        label: "Button link",
        hint: "#booking opens the booking form. You can also use /page or a full https:// link.",
        suggestions: ["#booking", "#services", "#packages", "#contact"],
      },
    ],
  },
  { title: "Photo", fields: [{ type: "image", name: "image_url", label: "Banner photo (optional)", folder: "offers", aspect: "aspect-[16/9]" }] },
  {
    title: "When it runs",
    fields: [
      { type: "datetime", name: "start_date", label: "Starts", hint: `Salon time (${timeZone}).` },
      { type: "datetime", name: "end_date", label: "Ends", hint: "The offer disappears from the website automatically after this." },
      { type: "toggle", name: "is_active", label: "Active", hint: "Turn off to pause the offer without deleting it." },
      { type: "toggle", name: "show_countdown", label: "Show countdown", hint: "Shows “Ends in 2d 4h” on the banner." },
    ],
  },
];

export function OfferForm({ id, defaults, timeZone }: { id: string | null; defaults: OfferValues; timeZone: string }) {
  return (
    <ContentForm
      schema={offerSchema}
      defaults={defaults}
      sections={sections(timeZone)}
      save={(v) => saveOffer(id, v)}
      success={id ? "Offer saved" : "Offer added"}
      listHref="/admin/offers"
    />
  );
}
