import type { ThemePreset, ThemePresetName } from "./types";

/**
 * Four ready-made themes. Pick one in site.config.ts → `theme`.
 * To create a client-specific theme, copy a preset, rename it, add the name
 * to `ThemePresetName` in types.ts and adjust the hex values.
 *
 * Contrast: every preset passes WCAG AA — text, muted text and accent-coloured text ≥ 4.5:1 on
 * bg / bgAlt / surface, button labels ≥ 4.5:1, gold rating stars ≥ 3:1. Re-check if you change colours
 * (e.g. webaim.org/resources/contrastchecker).
 */
export const themePresets: Record<ThemePresetName, ThemePreset> = {
  blush: {
    label: "Blush",
    scheme: "light",
    colors: {
      bg: "#FBF6F1",
      bgAlt: "#F5EAE3",
      surface: "#FFFDFB",
      text: "#3A1F2B",
      textMuted: "#6E5560",
      accent: "#A05360",
      accentContrast: "#FFF8F4",
      gold: "#A4824D",
      line: "rgba(58, 31, 43, 0.14)",
      glow: "#F2C4C4",
    },
  },

  "noir-gold": {
    label: "Noir & Gold",
    scheme: "dark",
    colors: {
      bg: "#0F0D0C",
      bgAlt: "#181413",
      surface: "#1F1A18",
      text: "#F3EBDD",
      textMuted: "#B3A693",
      accent: "#D4B27A",
      accentContrast: "#17120E",
      gold: "#E8CF9B",
      line: "rgba(243, 235, 221, 0.14)",
      glow: "#6B4F2A",
    },
  },

  sage: {
    label: "Sage",
    scheme: "light",
    colors: {
      bg: "#F5F4EE",
      bgAlt: "#E9ECE2",
      surface: "#FCFCF8",
      text: "#22302A",
      textMuted: "#56635B",
      accent: "#577058",
      accentContrast: "#F7F8F2",
      gold: "#9E8357",
      line: "rgba(34, 48, 42, 0.14)",
      glow: "#CFDCC6",
    },
  },

  lavender: {
    label: "Lavender",
    scheme: "light",
    colors: {
      bg: "#F8F5FA",
      bgAlt: "#EEE7F4",
      surface: "#FFFDFF",
      text: "#2D2240",
      textMuted: "#625877",
      accent: "#795CA1",
      accentContrast: "#FBF8FD",
      gold: "#9F8155",
      line: "rgba(45, 34, 64, 0.14)",
      glow: "#DCCDEE",
    },
  },
};
