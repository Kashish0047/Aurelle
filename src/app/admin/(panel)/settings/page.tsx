import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { requireAdmin } from "@/lib/admin/auth";
import { settingsToForm, type SettingsRow } from "@/lib/admin/settings";
import { salonNow } from "@/lib/booking/slots";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (
    <>
      <PageHeader title="Settings" description="Your business details, hours, look and how you appear on Google." />
      <SettingsForm defaults={settingsToForm(data as Partial<SettingsRow> | null)} today={salonNow().date} locale={siteConfig.locale} />
    </>
  );
}
