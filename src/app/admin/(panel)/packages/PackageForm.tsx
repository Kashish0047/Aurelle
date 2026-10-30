"use client";

import { Controller, useFieldArray } from "react-hook-form";
import { packageSchema, type PackageValues } from "@/lib/admin/schemas/catalog";
import { Field, FormSection, inputClass, SaveBar, textareaClass } from "@/components/admin/ui/form";
import { ImageUploader } from "@/components/admin/ui/ImageUploader";
import { Toggle } from "@/components/admin/ui/Toggle";
import { useAdminForm } from "@/components/admin/ui/useAdminForm";
import { currencySymbol } from "@/lib/format";
import { savePackage } from "./actions";

/** Add / edit a bridal or spa package, with a list of "what's included" lines. */
export function PackageForm({ id, defaults }: { id: string | null; defaults: PackageValues }) {
  const { form, onSubmit, saving, serverError } = useAdminForm(packageSchema, defaults, (v) => savePackage(id, v), {
    success: id ? "Package saved" : "Package added",
    redirectTo: "/admin/packages",
  });
  const { register, control, formState } = form;
  const e = formState.errors;
  const features = useFieldArray({ control, name: "features" });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <FormSection title="Details">
        <Field id="name" label="Package name" error={e.name?.message}>
          <input id="name" {...register("name")} placeholder="e.g. The Bridal Glow" className={inputClass(!!e.name)} aria-invalid={!!e.name} />
        </Field>
        <Field id="tagline" label="Tagline" error={e.tagline?.message} hint="A few words above the name, e.g. 'Pre-wedding prep'.">
          <input id="tagline" {...register("tagline")} className={inputClass(!!e.tagline)} />
        </Field>
        <Field id="description" label="Description (optional)" error={e.description?.message}>
          <textarea id="description" {...register("description")} rows={3} className={textareaClass(!!e.description)} />
        </Field>
      </FormSection>

      <FormSection title="Price">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="price" label={`Price (${currencySymbol})`} error={e.price?.message}>
            <input id="price" type="number" inputMode="numeric" min={0} {...register("price", { valueAsNumber: true })} className={inputClass(!!e.price)} aria-invalid={!!e.price} />
          </Field>
          <Field id="price_note" label="Price note" error={e.price_note?.message} hint="e.g. '3 sessions over 6 weeks'.">
            <input id="price_note" {...register("price_note")} className={inputClass(!!e.price_note)} />
          </Field>
        </div>
        <Controller control={control} name="price_from" render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label='Show as "from" price' />} />
      </FormSection>

      <FormSection title="What's included">
        <ul className="flex flex-col gap-2">
          {features.fields.map((f, i) => (
            <li key={f.id} className="flex gap-2">
              <input
                {...register(`features.${i}.value` as const)}
                aria-label={`Included item ${i + 1}`}
                placeholder="e.g. HD airbrush makeup"
                className={inputClass(!!e.features?.[i]?.value)}
              />
              <button type="button" onClick={() => features.remove(i)} aria-label={`Remove item ${i + 1}`} className="shrink-0 rounded-full px-3 text-sm text-muted hover:bg-bg-alt">
                Remove
              </button>
            </li>
          ))}
        </ul>
        {e.features?.message && <p className="text-xs text-accent">{e.features.message}</p>}
        {features.fields.length < 12 && (
          <button type="button" onClick={() => features.append({ value: "" })} className="w-fit rounded-full border border-line px-4 py-2 text-sm">
            + Add a line
          </button>
        )}
      </FormSection>

      <FormSection title="Button & photo">
        <Field id="cta_label" label="Button text" error={e.cta_label?.message} hint="The button opens WhatsApp with the package name.">
          <input id="cta_label" {...register("cta_label")} className={inputClass(!!e.cta_label)} />
        </Field>
        <Controller
          control={control}
          name="image_url"
          render={({ field }) => (
            <ImageUploader value={field.value} onChange={field.onChange} folder="packages" label="Photo (optional)" aspect="aspect-[4/3]" error={e.image_url?.message} />
          )}
        />
      </FormSection>

      <FormSection title="Visibility">
        <Controller control={control} name="is_published" render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Show on website" />} />
        <Controller
          control={control}
          name="is_highlighted"
          render={({ field }) => (
            <Toggle checked={field.value} onChange={field.onChange} label="Feature this package" description="Shown as the dark middle card with a 'Most loved' badge. Only one package can be featured." />
          )}
        />
      </FormSection>

      <SaveBar saving={saving} cancelHref="/admin/packages" error={serverError} />
    </form>
  );
}
