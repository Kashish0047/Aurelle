import type { CSSProperties } from "react";
import { siteConfig } from "@/config/site.config";
import { themePresets } from "@/config/theme.presets";
import type { ThemePreset, ThemePresetName } from "@/config/types";

/** The selected preset: site.config.ts, or the admin setting passed in from getSiteContent(). */
export function getActiveTheme(name: ThemePresetName = siteConfig.theme): ThemePreset {
  return themePresets[name] ?? themePresets[siteConfig.theme];
}

/**
 * Converts a preset into CSS custom properties. Applied as an inline style on <html>
 * during server render, so the correct palette is there on the very first paint.
 * globals.css maps these variables onto Tailwind colour utilities (bg-bg, text-accent…).
 */
export function themeToCssVars(theme: ThemePreset): CSSProperties {
  const c = theme.colors;
  return {
    "--bg": c.bg,
    "--bg-alt": c.bgAlt,
    "--surface": c.surface,
    "--text": c.text,
    "--text-muted": c.textMuted,
    "--accent": c.accent,
    "--accent-contrast": c.accentContrast,
    "--gold": c.gold,
    "--line": c.line,
    "--glow": c.glow,
    colorScheme: theme.scheme,
  } as CSSProperties;
}
