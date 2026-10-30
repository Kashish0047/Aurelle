import { Cormorant_Garamond, DM_Sans } from "next/font/google";

/**
 * Fonts are self-hosted at build time by next/font (no layout shift, no Google request at runtime).
 * To change fonts, swap the imports above for any Google Font and keep the `variable` names.
 * Examples that suit this template: Playfair_Display / Bodoni_Moda (serif), Inter / Manrope (sans).
 *
 * Only the weights the design uses are loaded (fewer font files = faster first paint).
 * If you add `font-light` / `font-semibold` etc. somewhere, add that weight here too.
 */
export const serifFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif-family",
  display: "swap",
});

export const sansFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans-family",
  display: "swap",
});
