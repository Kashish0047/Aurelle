import { contentConfig } from "@/config/content.config";
import { siteConfig } from "@/config/site.config";

const priceFormatter = new Intl.NumberFormat(siteConfig.locale, {
  style: "currency",
  currency: siteConfig.currency,
  maximumFractionDigits: 0,
});

/** "₹4,500" or "from ₹4,500". */
export function formatPrice(amount: number, from = false): string {
  const value = priceFormatter.format(amount);
  return from ? `${contentConfig.ui.from} ${value}` : value;
}

/** 45 → "45 min", 90 → "1 h 30 min", 120 → "2 h". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** "14:00" → "2 pm", "09:30" → "9:30 am". */
export function formatTime(time: string): string {
  const [hStr = "0", mStr = "0"] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** The site currency's symbol, e.g. "₹" — for labels like "Price (₹)". */
export const currencySymbol =
  priceFormatter.formatToParts(0).find((p) => p.type === "currency")?.value ?? siteConfig.currency;
