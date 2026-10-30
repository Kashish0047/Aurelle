"use client";

import { Controller } from "react-hook-form";
import { slugify } from "@/lib/admin/fields";
import { serviceSchema, type ServiceValues } from "@/lib/admin/schemas/catalog";
import { describedBy, Field, FormSection, inputClass, SaveBar, textareaClass } from "@/components/admin/ui/form";
import { ImageUploader } from "@/components/admin/ui/ImageUploader";
import { Toggle } from "@/components/admin/ui/Toggle";
import { useAdminForm } from "@/components/admin/ui/useAdminForm";
import { currencySymbol } from "@/lib/format";
import { saveService } from "./actions";

interface Props {
  id: string | null;
  defaults: ServiceValues;
  categories: { id: string; name: string }[];
}

/** Add / edit a service. Price and duration feed the public booking form automatically. */
export function ServiceForm({ id, defaults, categories }: Props) {
  const { form, onSubmit, saving, serverError } = useAdminForm(serviceSchema, defaults, (v) => saveService(id, v), {
    success: id ? "Service saved" : "Service added",
    redirectTo: "/admin/services",
  });
  const { register, control, watch, setValue, getFieldState, formState } = form;
  const e = formState.errors;
  const description = watch("description") ?? "";

  // While adding, keep the link name in step with the service name until it's edited by hand.
  const name = register("name", {
    onChange: (ev: { target: { value: string } }) => {
      if (!id && !getFieldState("slug").isDirty) setValue("slug", slugify(ev.target.value), { shouldValidate: true });
    },
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <FormSection title="Details">
        <Field id="name" label="Service name" error={e.name?.message}>
          <input id="name" {...name} placeholder="e.g. Hydra Glow Facial" className={inputClass(!!e.name)} aria-invalid={!!e.name} aria-describedby={describedBy("name", e.name?.message)} />
        </Field>
        <Field id="category_id" label="Category" error={e.category_id?.message} hint={categories.length ? undefined : "Add a category first (Services → Manage categories)."}>
          <select id="category_id" {...register("category_id")} className={inputClass(!!e.category_id)} aria-invalid={!!e.category_id}>
            <option value="">Choose a category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field id="description" label="Short description" error={e.description?.message} aside={`${description.length}/400`} hint="One or two sentences shown on the service card.">
          <textarea id="description" {...register("description")} rows={3} placeholder="What's included, who it's for…" className={textareaClass(!!e.description)} aria-describedby={describedBy("description", e.description?.message, "x")} />
        </Field>
      </FormSection>

      <FormSection title="Price & time">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="price" label={`Price (${currencySymbol})`} error={e.price?.message}>
            <input id="price" type="number" inputMode="numeric" min={0} step={1} {...register("price", { valueAsNumber: true })} className={inputClass(!!e.price)} aria-invalid={!!e.price} />
          </Field>
          <Field id="duration_min" label="Duration (minutes)" error={e.duration_min?.message} hint="Used to work out which booking times fit.">
            <input id="duration_min" type="number" inputMode="numeric" min={5} step={5} {...register("duration_min", { valueAsNumber: true })} className={inputClass(!!e.duration_min)} aria-invalid={!!e.duration_min} />
          </Field>
        </div>
        <Controller
          control={control}
          name="price_from"
          render={({ field }) => (
            <Toggle checked={field.value} onChange={field.onChange} label='Show as "from" price' description="For services where the final price depends on hair length, etc." />
          )}
        />
      </FormSection>

      <FormSection title="Photo">
        <Controller
          control={control}
          name="image_url"
          render={({ field }) => (
            <ImageUploader value={field.value} onChange={field.onChange} folder="services" label="Service photo" error={e.image_url?.message} />
          )}
        />
        <Field id="image_alt" label="Describe the photo" hint="For people using screen readers, e.g. 'Stylist painting soft caramel balayage'." error={e.image_alt?.message}>
          <input id="image_alt" {...register("image_alt")} className={inputClass(!!e.image_alt)} />
        </Field>
      </FormSection>

      <FormSection title="Visibility">
        <Controller control={control} name="is_published" render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Show on website" description="Hidden services can't be booked." />} />
        <Controller control={control} name="is_popular" render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label='Mark as "Popular"' />} />
        <Field id="slug" label="Link name" error={e.slug?.message} hint="Used in booking links. Only change it if you know why.">
          <input id="slug" {...register("slug")} className={inputClass(!!e.slug)} aria-invalid={!!e.slug} />
        </Field>
      </FormSection>

      <SaveBar saving={saving} cancelHref="/admin/services" error={serverError} />
    </form>
  );
}
