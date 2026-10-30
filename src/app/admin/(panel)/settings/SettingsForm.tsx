"use client";

import { useState, type ReactNode } from "react";
import { Controller, useFieldArray, type FieldErrors } from "react-hook-form";
import { themePresets } from "@/config/theme.presets";
import { SECTION_LABELS, settingsSchema, THEMES, WEEKDAYS, type SettingsValues } from "@/lib/admin/schemas/settings";
import { cn } from "@/lib/cn";
import { describedBy, Field, FormSection, inputClass, SaveBar, textareaClass } from "@/components/admin/ui/form";
import { ImageUploader } from "@/components/admin/ui/ImageUploader";
import { Toggle } from "@/components/admin/ui/Toggle";
import { useAdminForm } from "@/components/admin/ui/useAdminForm";
import { saveSettings } from "./actions";
import { ThemePreview } from "./ThemePreview";

const JUMP = [
  { id: "business", label: "Business" },
  { id: "hours", label: "Hours" },
  { id: "holidays", label: "Closed days" },
  { id: "look", label: "Theme & logo" },
  { id: "hero", label: "Hero text" },
  { id: "sections", label: "Sections" },
  { id: "seo", label: "Google" },
];

function errorAt(errors: FieldErrors, path: string): string | undefined {
  let node: unknown = errors;
  for (const key of path.split(".")) node = (node as Record<string, unknown> | undefined)?.[key];
  return (node as { message?: string } | undefined)?.message;
}

const Anchor = ({ id, children }: { id: string; children: ReactNode }) => (
  <div id={id} className="scroll-mt-24">
    {children}
  </div>
);

export function SettingsForm({ defaults, today, locale }: { defaults: SettingsValues; today: string; locale: string }) {
  const { form, onSubmit, saving, serverError } = useAdminForm(settingsSchema, defaults, saveSettings, {
    success: "Settings saved",
    redirectTo: "/admin/settings",
  });
  const { register, control, watch, formState, setValue, getValues } = form;
  const breaks = useFieldArray({ control, name: "breaks" });
  const holidays = useFieldArray({ control, name: "holidays" });
  const [newHoliday, setNewHoliday] = useState("");

  const err = (path: string) => errorAt(formState.errors, path);
  const input = (path: string, label: string, opts: { hint?: string; placeholder?: string; type?: string; max?: number } = {}) => {
    const e = err(path);
    const value = opts.max ? String(watch(path as never) ?? "") : "";
    return (
      <Field id={path} label={label} hint={opts.hint} error={e} aside={opts.max ? `${value.length}/${opts.max}` : undefined}>
        <input
          id={path}
          {...register(path as never)}
          type={opts.type ?? "text"}
          placeholder={opts.placeholder}
          aria-invalid={!!e}
          aria-describedby={describedBy(path, e, opts.hint)}
          className={inputClass(!!e)}
        />
      </Field>
    );
  };

  const theme = watch("theme");
  const headline = watch("hero.headline");
  const shortName = watch("short_name");
  const seoTitle = watch("seo_title");
  const seoDescription = watch("seo_description");
  const holidayList = watch("holidays");
  const fmt = (d: string) => new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`));

  const addHoliday = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newHoliday)) return;
    if (!getValues("holidays").some((h) => h.value === newHoliday)) holidays.append({ value: newHoliday });
    setNewHoliday("");
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <nav aria-label="Settings sections" className="sticky top-16 z-10 -mx-4 flex gap-1.5 overflow-x-auto bg-bg-alt/95 px-4 py-2 backdrop-blur md:-mx-8 md:px-8">
        {JUMP.map((j) => (
          <a key={j.id} href={`#${j.id}`} className="shrink-0 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm hover:border-ink/40">
            {j.label}
          </a>
        ))}
      </nav>

      <Anchor id="business">
        <FormSection title="Business details">
          <div className="grid gap-5 sm:grid-cols-2">
            {input("business_name", "Business name", { placeholder: "Aurelle Beauty Studio" })}
            {input("short_name", "Short name", { hint: "Shown in the logo text and browser tab." })}
          </div>
          {input("tagline", "Tagline", { max: 120 })}
          <Field id="description" label="Short description" error={err("description")} aside={`${String(watch("description") ?? "").length}/300`}>
            <textarea id="description" {...register("description")} rows={3} className={textareaClass(!!err("description"))} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            {input("phone", "Phone (as shown on the site)", { placeholder: "+91 98765 43210", type: "tel" })}
            {input("whatsapp", "WhatsApp number", { hint: "Country code + number, digits only, e.g. 919876543210.", type: "tel" })}
          </div>
          {input("email", "Email", { type: "email" })}
          <div className="grid gap-5 sm:grid-cols-2">
            {input("address.line1", "Address line 1")}
            {input("address.line2", "Address line 2 (optional)")}
            {input("address.city", "City")}
            {input("address.region", "State")}
            {input("address.postalCode", "PIN code")}
            {input("address.country", "Country code", { hint: "Two letters, e.g. IN." })}
          </div>
          {input("maps_link", "Google Maps link", { hint: "Google Maps → Share → Copy link.", placeholder: "https://maps.google.com/?q=…" })}
          {input("maps_embed_url", "Google Maps embed link (optional)", { hint: "Google Maps → Share → Embed a map → copy only the link inside src=\"…\"." })}
          <div className="grid gap-5 sm:grid-cols-3">
            {input("instagram_url", "Instagram", { placeholder: "https://instagram.com/…" })}
            {input("facebook_url", "Facebook", { placeholder: "https://facebook.com/…" })}
            {input("youtube_url", "YouTube", { placeholder: "https://youtube.com/…" })}
          </div>
        </FormSection>
      </Anchor>

      <Anchor id="hours">
        <FormSection title="Opening hours">
          <p className="-mt-2 text-sm text-muted">Online booking only offers times inside these hours.</p>
          <ul className="flex flex-col divide-y divide-line">
            {WEEKDAYS.map(({ key, label }) => {
              const open = watch(`hours.${key}.open`);
              const e = err(`hours.${key}.to`);
              return (
                <li key={key} className="grid gap-3 py-3 sm:grid-cols-[9rem_8rem_1fr] sm:items-center">
                  <span className="text-sm font-medium">{label}</span>
                  <Controller
                    control={control}
                    name={`hours.${key}.open`}
                    render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label={field.value ? "Open" : "Closed"} />}
                  />
                  {open ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <input type="time" aria-label={`${label} opens`} {...register(`hours.${key}.from`)} className={cn(inputClass(), "w-32!")} />
                        <span className="text-sm text-muted">to</span>
                        <input
                          type="time"
                          aria-label={`${label} closes`}
                          aria-invalid={!!e}
                          {...register(`hours.${key}.to`)}
                          className={cn(inputClass(!!e), "w-32!")}
                        />
                      </div>
                      {e && <p className="text-xs text-accent">{e}</p>}
                    </div>
                  ) : (
                    <span className="text-sm text-muted">Closed all day</span>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">Daily breaks</p>
            {breaks.fields.length === 0 && <p className="text-sm text-muted">No breaks: clients can book any time you&apos;re open.</p>}
            {breaks.fields.map((b, i) => {
              const e = err(`breaks.${i}.end`);
              return (
                <div key={b.id} className="flex flex-wrap items-center gap-2">
                  <input type="time" aria-label={`Break ${i + 1} starts`} {...register(`breaks.${i}.start`)} className={cn(inputClass(), "w-32!")} />
                  <span className="text-sm text-muted">to</span>
                  <input type="time" aria-label={`Break ${i + 1} ends`} aria-invalid={!!e} {...register(`breaks.${i}.end`)} className={cn(inputClass(!!e), "w-32!")} />
                  <input aria-label={`Break ${i + 1} name`} placeholder="Lunch" {...register(`breaks.${i}.label`)} className={cn(inputClass(), "w-36!")} />
                  <button type="button" onClick={() => breaks.remove(i)} className="rounded-full px-3 py-2 text-sm text-muted hover:bg-bg-alt">
                    Remove
                  </button>
                  {e && <p className="w-full text-xs text-accent">{e}</p>}
                </div>
              );
            })}
            {breaks.fields.length < 5 && (
              <button
                type="button"
                onClick={() => breaks.append({ start: "14:00", end: "14:30", label: "" })}
                className="w-fit rounded-full border border-line px-4 py-2 text-sm hover:border-ink/40"
              >
                + Add a break
              </button>
            )}
          </div>
        </FormSection>
      </Anchor>

      <Anchor id="holidays">
        <FormSection title="Closed days & holidays">
          <p className="-mt-2 text-sm text-muted">Clients can&apos;t book on these dates.</p>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-sm">
              Add a date
              <input
                type="date"
                min={today}
                value={newHoliday}
                onChange={(e) => setNewHoliday(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addHoliday();
                  }
                }}
                className={cn(inputClass(), "w-48!")}
              />
            </label>
            <button type="button" onClick={addHoliday} disabled={!newHoliday} className="h-11 rounded-full bg-ink px-5 text-sm text-bg disabled:opacity-40">
              Add
            </button>
          </div>
          {holidays.fields.length === 0 ? (
            <p className="text-sm text-muted">No closed days added.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {holidays.fields
                .map((f, i) => ({ id: f.id, i, value: holidayList[i]?.value ?? f.value }))
                .sort((a, b) => a.value.localeCompare(b.value))
                .map((h) => (
                  <li key={h.id} className={cn("flex items-center gap-1 rounded-full border border-line bg-bg py-1 pr-1 pl-3 text-sm", h.value < today && "text-muted")}>
                    {fmt(h.value)}
                    {h.value < today && <span className="text-xs">(past)</span>}
                    <button type="button" aria-label={`Remove ${fmt(h.value)}`} onClick={() => holidays.remove(h.i)} className="grid size-7 place-items-center rounded-full hover:bg-bg-alt">
                      ×
                    </button>
                  </li>
                ))}
            </ul>
          )}
          {holidayList.some((h) => h.value < today) && (
            <button
              type="button"
              onClick={() => holidays.remove(holidayList.flatMap((h, i) => (h.value < today ? [i] : [])))}
              className="w-fit text-sm text-accent underline-offset-4 hover:underline"
            >
              Remove past dates
            </button>
          )}
        </FormSection>
      </Anchor>

      <Anchor id="look">
        <FormSection title="Theme & logo">
          <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
            <Controller
              control={control}
              name="theme"
              render={({ field }) => (
                <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-3 self-start">
                  {THEMES.map((t) => {
                    const c = themePresets[t].colors;
                    const checked = field.value === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        onClick={() => field.onChange(t)}
                        className={cn(
                          "flex flex-col gap-3 rounded-2xl border-2 p-4 text-left transition-colors",
                          checked ? "border-ink" : "border-line hover:border-ink/40",
                        )}
                      >
                        <span className="flex -space-x-2">
                          {[c.bg, c.accent, c.text, c.gold].map((color) => (
                            <span key={color} className="size-7 rounded-full border border-black/10" style={{ background: color }} />
                          ))}
                        </span>
                        <span className="text-sm">
                          {themePresets[t].label}
                          {checked && <span className="ml-1 text-muted">· selected</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
            <ThemePreview theme={theme} name={shortName || "Your salon"} headline={headline} />
          </div>
          <Controller
            control={control}
            name="logo_url"
            render={({ field }) => (
              <ImageUploader
                value={field.value ?? ""}
                onChange={field.onChange}
                folder="brand"
                label="Logo (optional)"
                hint="A wide logo with a transparent background works best. Without one, the short name is shown in elegant type."
                aspect="aspect-[3/1]"
                error={err("logo_url")}
              />
            )}
          />
        </FormSection>
      </Anchor>

      <Anchor id="hero">
        <FormSection title="Hero (top of the home page)">
          {input("hero.eyebrow", "Small line above the headline", { placeholder: "Beauty Studio · Mumbai" })}
          <Field id="hero.headline" label="Headline" hint="Each line on its own row (up to 4)." error={err("hero.headline")}>
            <textarea id="hero.headline" {...register("hero.headline")} rows={3} className={textareaClass(!!err("hero.headline"))} />
          </Field>
          <Field id="hero.subheading" label="Subheading" error={err("hero.subheading")} aside={`${String(watch("hero.subheading") ?? "").length}/220`}>
            <textarea id="hero.subheading" {...register("hero.subheading")} rows={2} className={textareaClass(!!err("hero.subheading"))} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            {input("hero.primaryCta", "Main button", { placeholder: "Book Appointment" })}
            {input("hero.secondaryCta", "Second button (optional)", { placeholder: "View Services" })}
          </div>
        </FormSection>
      </Anchor>

      <Anchor id="sections">
        <FormSection title="Sections on the home page">
          <p className="-mt-2 text-sm text-muted">Switch off anything you don&apos;t need; menu links to it disappear too.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {(Object.keys(SECTION_LABELS) as (keyof typeof SECTION_LABELS)[]).map((k) => (
              <Controller
                key={k}
                control={control}
                name={`sections.${k}`}
                render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label={SECTION_LABELS[k]} />}
              />
            ))}
          </div>
          <div className="flex gap-3 text-sm">
            <button type="button" className="text-accent hover:underline" onClick={() => Object.keys(SECTION_LABELS).forEach((k) => setValue(`sections.${k as "about"}`, true, { shouldDirty: true }))}>
              Turn all on
            </button>
          </div>
        </FormSection>
      </Anchor>

      <Anchor id="seo">
        <FormSection title="How you look on Google">
          {input("seo_title", "Page title", { max: 70, hint: "About 50–60 characters reads best." })}
          <Field id="seo_description" label="Description" error={err("seo_description")} aside={`${String(seoDescription ?? "").length}/170`}>
            <textarea id="seo_description" {...register("seo_description")} rows={3} className={textareaClass(!!err("seo_description"))} />
          </Field>
          <div aria-label="Google search preview" className="rounded-xl border border-line bg-white p-4 font-sans text-left">
            <p className="text-xs text-[#4d5156]">{shortName || "yoursalon"}.com</p>
            <p className="mt-1 truncate text-lg text-[#1a0dab]">{seoTitle || "Your page title"}</p>
            <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">{seoDescription || "Your description appears here."}</p>
          </div>
        </FormSection>
      </Anchor>

      <SaveBar saving={saving} cancelHref="/admin" error={serverError} />
    </form>
  );
}
