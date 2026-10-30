/**
 * Generates soft, on-brand placeholder JPGs for every "/images/....jpg" path
 * referenced in src/config/*.ts — so a fresh copy of the template never shows
 * broken images. Replace them with real, licensed photos before going live.
 *
 *   npm run placeholders            # create missing images only
 *   npm run placeholders -- --force # regenerate all
 */
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const CONFIG_DIR = join(ROOT, "src", "config");
const PUBLIC_DIR = join(ROOT, "public");
const force = process.argv.includes("--force");

/** Output size by folder / filename. */
function sizeFor(path) {
  if (path.endsWith("/og.jpg")) return [1200, 630];
  if (path.endsWith("/hero.jpg")) return [1920, 1280];
  if (path.includes("/team/")) return [900, 1200];
  if (path.includes("/gallery/")) return [1200, 1500];
  return [1200, 1500];
}

/** Deterministic pseudo-random generator so each file always gets the same artwork. */
function seeded(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const PALETTES = [
  ["#F7E6E0", "#E9B8BE", "#C98C99", "#F3D9C4"],
  ["#F4E9DF", "#E3C7A6", "#C9A27A", "#F6DCD3"],
  ["#F3E4EA", "#D9B3C6", "#B98AA6", "#F1D7C9"],
  ["#F6ECE4", "#EBCFC0", "#D6A79A", "#E9D3E0"],
];

function svgFor(path, w, h) {
  const rand = seeded(path);
  const [bg, a, b, c] = PALETTES[Math.floor(rand() * PALETTES.length)];
  const label = path
    .split("/")
    .pop()
    .replace(/\.\w+$/, "")
    .replace(/[-_]/g, " ");
  const blobs = [a, b, c, a]
    .map((color) => {
      const cx = (0.15 + rand() * 0.7) * w;
      const cy = (0.15 + rand() * 0.7) * h;
      const r = (0.25 + rand() * 0.3) * Math.max(w, h);
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${0.45 + rand() * 0.4}"/>`;
    })
    .join("");
  const fontSize = Math.round(Math.min(w, h) * 0.06);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs><filter id="blur"><feGaussianBlur stdDeviation="${Math.max(w, h) * 0.08}"/></filter></defs>
  <rect width="100%" height="100%" fill="${bg}"/>
  <g filter="url(#blur)">${blobs}</g>
  <text x="50%" y="${h - fontSize * 1.6}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
        font-style="italic" font-size="${fontSize}" fill="#3A1F2B" fill-opacity="0.45">${label}</text>
</svg>`;
}

const paths = new Set();
for (const file of readdirSync(CONFIG_DIR).filter((f) => f.endsWith(".ts"))) {
  const src = readFileSync(join(CONFIG_DIR, file), "utf8");
  for (const m of src.matchAll(/["'](\/images\/[^"']+\.(?:jpe?g|png|webp))["']/g)) paths.add(m[1]);
}

let created = 0;
for (const p of paths) {
  const out = join(PUBLIC_DIR, p);
  if (existsSync(out) && !force) continue;
  mkdirSync(dirname(out), { recursive: true });
  const [w, h] = sizeFor(p);
  await sharp(Buffer.from(svgFor(p, w, h))).jpeg({ quality: 78, mozjpeg: true }).toFile(out);
  created++;
}

console.log(`Placeholders: ${created} created, ${paths.size - created} already present (${paths.size} referenced).`);
