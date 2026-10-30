"use client";

import { ContentForm, type FormSectionDef } from "@/components/admin/ui/ContentForm";
import { galleryItemSchema, type GalleryItemValues } from "@/lib/admin/schemas/content";
import { saveGalleryItem } from "./actions";

const sections = (categories: string[]): FormSectionDef[] => [
  {
    title: "Photos",
    fields: [
      { type: "image", name: "image_url", label: "Photo (the “after” for before/after)", folder: "gallery", aspect: "aspect-square" },
      {
        type: "image",
        name: "before_image_url",
        label: "“Before” photo (optional)",
        hint: "Add one to show a before/after slider that visitors can drag.",
        folder: "gallery",
        aspect: "aspect-square",
      },
      { type: "text", name: "image_alt", label: "Photo description", hint: "For screen readers and Google, e.g. “Bride with soft glam makeup”." },
    ],
  },
  {
    title: "Details",
    fields: [
      { type: "text", name: "title", label: "Caption (optional)", placeholder: "Honey balayage" },
      { type: "text", name: "category", label: "Category (optional)", hint: "Pick one or type your own.", suggestions: categories },
      {
        type: "select",
        name: "size",
        label: "Tile shape",
        options: [
          { value: "square", label: "Square" },
          { value: "tall", label: "Tall (portrait)" },
          { value: "wide", label: "Wide (landscape)" },
        ],
      },
      { type: "toggle", name: "is_published", label: "Show on website" },
    ],
  },
];

interface Props {
  id: string | null;
  defaults: GalleryItemValues;
  categories: string[];
}

export function GalleryForm({ id, defaults, categories }: Props) {
  return (
    <ContentForm
      schema={galleryItemSchema}
      defaults={defaults}
      sections={sections(categories)}
      save={(v) => saveGalleryItem(id, v)}
      success={id ? "Photo saved" : "Photo added"}
      listHref="/admin/gallery"
    />
  );
}
