import { brandIcon } from "@/lib/brandIcon";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Browser-tab favicon, generated from the brand name and theme. */
export default function Icon() {
  return brandIcon(64);
}
