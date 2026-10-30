"use client";

import { Controller, type FieldValues } from "react-hook-form";
import type { z } from "zod";
import type { ActionResult } from "@/lib/admin/result";
import { cn } from "@/lib/cn";
import { describedBy, Field, FormSection, inputClass, SaveBar, textareaClass } from "./form";
import { ImageUploader } from "./ImageUploader";
import { Toggle } from "./Toggle";
import { useAdminForm } from "./useAdminForm";

export type FieldDef =
  | { type: "text" | "url" | "datetime"; name: string; label: string; hint?: string; placeholder?: string; suggestions?: string[] }
  | { type: "textarea"; name: string; label: string; hint?: string; placeholder?: string; max?: number; rows?: number }
  | { type: "toggle"; name: string; label: string; hint?: string }
  | { type: "select"; name: string; label: string; hint?: string; options: { value: string; label: string }[] }
  | { type: "rating"; name: string; label: string; hint?: string }
  | { type: "image"; name: string; label: string; hint?: string; folder: string; aspect?: string };

export interface FormSectionDef {
  title: string;
  fields: FieldDef[];
}

interface Props<S extends z.ZodType<FieldValues, FieldValues>> {
  schema: S;
  defaults: z.input<S>;
  sections: FormSectionDef[];
  save: (values: z.input<S>) => Promise<ActionResult>;
  success: string;
  listHref: string;
}

/**
 * A complete admin form described as data: sections of fields (text, textarea with counter,
 * toggle, select, star rating, date & time, link, image upload with suggestions where useful).
 * Validation uses the shared Zod schema; saving goes through the given server action.
 */
export function ContentForm<S extends z.ZodType<FieldValues, FieldValues>>({ schema, defaults, sections, save, success, listHref }: Props<S>) {
  const { form, onSubmit, saving, serverError } = useAdminForm(schema, defaults as never, save, { success, redirectTo: listHref });
  const { register, control, watch, formState } = form;
  const errorOf = (name: string) => (formState.errors as Record<string, { message?: string } | undefined>)[name]?.message;

  const render = (f: FieldDef) => {
    const error = errorOf(f.name);
    const common = { id: f.name, "aria-invalid": !!error, "aria-describedby": describedBy(f.name, error, f.hint) };

    switch (f.type) {
      case "toggle":
        return (
          <Controller
            key={f.name}
            control={control}
            name={f.name as never}
            render={({ field }) => <Toggle checked={Boolean(field.value)} onChange={field.onChange} label={f.label} description={f.hint} />}
          />
        );
      case "image":
        return (
          <Controller
            key={f.name}
            control={control}
            name={f.name as never}
            render={({ field }) => (
              <ImageUploader value={(field.value as string) ?? ""} onChange={field.onChange} folder={f.folder} label={f.label} hint={f.hint} aspect={f.aspect} error={error} />
            )}
          />
        );
      case "rating":
        return (
          <Controller
            key={f.name}
            control={control}
            name={f.name as never}
            render={({ field }) => (
              <fieldset>
                <legend className="text-sm">{f.label}</legend>
                <div role="radiogroup" aria-label={f.label} className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={field.value === n}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      onClick={() => field.onChange(n)}
                      className={cn("text-2xl leading-none transition-colors", n <= Number(field.value) ? "text-gold" : "text-line")}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {error && <p className="mt-1 text-xs text-accent">{error}</p>}
              </fieldset>
            )}
          />
        );
      case "textarea": {
        const value = (watch(f.name as never) as unknown as string | undefined) ?? "";
        return (
          <Field key={f.name} id={f.name} label={f.label} hint={f.hint} error={error} aside={f.max ? `${value.length}/${f.max}` : undefined}>
            <textarea {...register(f.name as never)} {...common} rows={f.rows ?? 4} placeholder={f.placeholder} className={textareaClass(!!error)} />
          </Field>
        );
      }
      case "select":
        return (
          <Field key={f.name} id={f.name} label={f.label} hint={f.hint} error={error}>
            <select {...register(f.name as never)} {...common} className={inputClass(!!error)}>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        );
      default: {
        const listId = f.suggestions?.length ? `${f.name}-suggestions` : undefined;
        return (
          <Field key={f.name} id={f.name} label={f.label} hint={f.hint} error={error}>
            <input
              {...register(f.name as never)}
              {...common}
              type={f.type === "datetime" ? "datetime-local" : f.type === "url" ? "url" : "text"}
              inputMode={f.type === "url" ? "url" : undefined}
              placeholder={f.placeholder}
              list={listId}
              className={inputClass(!!error)}
            />
            {listId && (
              <datalist id={listId}>
                {f.suggestions!.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            )}
          </Field>
        );
      }
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {sections.map((s) => (
        <FormSection key={s.title} title={s.title}>
          {s.fields.map(render)}
        </FormSection>
      ))}
      <SaveBar saving={saving} cancelHref={listHref} error={serverError} />
    </form>
  );
}
