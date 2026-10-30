import type { CSSProperties } from "react";
import { themePresets } from "@/config/theme.presets";
import type { ThemePresetName } from "@/config/types";

/** A miniature of the website in the chosen theme: background, heading, text, button, card, stars. */
export function ThemePreview({ theme, name, headline }: { theme: ThemePresetName; name: string; headline: string }) {
  const c = themePresets[theme].colors;
  const box: CSSProperties = { background: c.bg, color: c.text, borderColor: c.line };
  return (
    <div aria-label={`Preview of the ${themePresets[theme].label} theme`} role="img" className="overflow-hidden rounded-2xl border transition-colors" style={box}>
      <div className="flex items-center justify-between px-5 py-3 text-xs" style={{ borderBottom: `1px solid ${c.line}` }}>
        <span className="font-serif text-base">{name}</span>
        <span className="rounded-full px-3 py-1" style={{ background: c.accent, color: c.accentContrast }}>
          Book now
        </span>
      </div>
      <div className="relative px-5 py-7">
        <div className="absolute -top-10 right-0 size-40 rounded-full opacity-60 blur-3xl" style={{ background: c.glow }} />
        <p className="relative text-[10px] tracking-[0.2em] uppercase" style={{ color: c.textMuted }}>
          Beauty studio
        </p>
        <p className="relative mt-2 font-serif text-2xl leading-tight whitespace-pre-line">{headline || "Your headline"}</p>
        <div className="relative mt-5 grid grid-cols-2 gap-3">
          {["Hydra Facial", "Balayage"].map((s) => (
            <div key={s} className="rounded-xl p-3 text-xs" style={{ background: c.surface, border: `1px solid ${c.line}` }}>
              <p>{s}</p>
              <p className="mt-1" style={{ color: c.textMuted }}>
                60 min
              </p>
              <p className="mt-2" style={{ color: c.gold }}>
                ★★★★★
              </p>
            </div>
          ))}
        </div>
        <p className="relative mt-4 text-xs" style={{ color: c.accent }}>
          View all services →
        </p>
      </div>
    </div>
  );
}
