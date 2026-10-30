import { ImageResponse } from "next/og";
import { getSiteContent } from "@/lib/content/server";
import { getActiveTheme } from "@/lib/theme";

/**
 * Generates the favicon / app icon from config: the brand's first letter on the theme accent.
 * To use a designed logo instead, delete src/app/icon.tsx + apple-icon.tsx and drop
 * `icon.png` / `apple-icon.png` files into src/app/.
 */
export async function brandIcon(size: number) {
  const { site } = await getSiteContent();
  const { colors } = getActiveTheme(site.theme);
  const letter = Array.from(site.name)[0]?.toUpperCase() ?? "•";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: colors.accent,
          color: colors.accentContrast,
          borderRadius: size * 0.22,
          fontSize: size * 0.62,
          fontFamily: "Georgia, serif",
        }}
      >
        {letter}
      </div>
    ),
    { width: size, height: size },
  );
}
