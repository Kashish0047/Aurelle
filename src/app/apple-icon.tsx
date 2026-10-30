import { brandIcon } from "@/lib/brandIcon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS home-screen icon, generated from the brand name and theme. */
export default function AppleIcon() {
  return brandIcon(180);
}
