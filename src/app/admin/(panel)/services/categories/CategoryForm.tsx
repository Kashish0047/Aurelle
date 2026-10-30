"use client";

import { slugify } from "@/lib/admin/fields";
import { categorySchema, type CategoryValues } from "@/lib/admin/schemas/catalog";
import { Field, FormSection, inputClass, SaveBar } from "@/components/admin/ui/form";
import { useAdminForm } from "@/components/admin/ui/useAdminForm";
import { saveCategory } from "../actions";

/** Add / rename a service category (the filter chips on the website). */
export function CategoryForm({ id, defaults }: { id: string | null; defaults: CategoryValues }) {
  const { form, onSubmit, saving, serverError } = useAdminForm(categorySchema, defaults, (v) => saveCategory(id, v), {
    success: id ? "Category saved" : "Category added",
    redirectTo: "/admin/services/categories",
  });
  const { register, setValue, getFieldState, formState } = form;
  const e = formState.errors;
  const name = register("name", {
    onChange: (ev: { target: { value: string } }) => {
      if (!id && !getFieldState("slug").isDirty) setValue("slug", slugify(ev.target.value), { shouldValidate: true });
    },
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <FormSection title="Category">
        <Field id="name" label="Name" error={e.name?.message} hint="Shown as a filter button above your services, e.g. 'Hair'.">
          <input id="name" {...name} placeholder="e.g. Hair" className={inputClass(!!e.name)} aria-invalid={!!e.name} />
        </Field>
        <Field id="slug" label="Link name" error={e.slug?.message} hint="Lowercase, no spaces. Filled in for you.">
          <input id="slug" {...register("slug")} className={inputClass(!!e.slug)} aria-invalid={!!e.slug} />
        </Field>
      </FormSection>
      <SaveBar saving={saving} cancelHref="/admin/services/categories" error={serverError} />
    </form>
  );
}
