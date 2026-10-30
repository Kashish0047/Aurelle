import type { GalleryItem } from "./types";

/**
 * `size` controls the tile shape in the lookbook grid: "tall" | "wide" | "square".
 * Use `type: "before-after"` for a draggable comparison slider.
 */
export const gallery: GalleryItem[] = [
  {
    type: "image",
    id: "g1",
    size: "tall",
    caption: "Soft bridal glam",
    image: { src: "/images/gallery/g1.jpg", alt: "Bride with soft glam makeup and loose curls" },
  },
  {
    type: "image",
    id: "g2",
    size: "square",
    caption: "Honey balayage",
    image: { src: "/images/gallery/g2.jpg", alt: "Honey-toned balayage on wavy hair" },
  },
  {
    type: "before-after",
    id: "ba1",
    size: "wide",
    caption: "Hydra Glow Facial — after one session",
    before: { src: "/images/gallery/ba1-before.jpg", alt: "Skin before the Hydra Glow Facial" },
    after: { src: "/images/gallery/ba1-after.jpg", alt: "Skin after the Hydra Glow Facial" },
  },
  {
    type: "image",
    id: "g3",
    size: "square",
    caption: "Chrome nail art",
    image: { src: "/images/gallery/g3.jpg", alt: "Chrome nail art on almond nails" },
  },
  {
    type: "image",
    id: "g4",
    size: "tall",
    caption: "Reception updo",
    image: { src: "/images/gallery/g4.jpg", alt: "Elegant low bun with fresh flowers" },
  },
  {
    type: "image",
    id: "g5",
    size: "wide",
    caption: "The studio at golden hour",
    image: { src: "/images/gallery/g5.jpg", alt: "Salon interior with arched mirrors at golden hour" },
  },
  {
    type: "image",
    id: "g6",
    size: "square",
    caption: "Lash lift",
    image: { src: "/images/gallery/g6.jpg", alt: "Close-up of lifted, tinted lashes" },
  },
];
