"use client";

import { useState, type ReactNode } from "react";
import { contentConfig } from "@/config/content.config";
import { siteConfig } from "@/config/site.config";
import { formatPhoneDisplay } from "@/lib/booking/schema";
import { dateParts, formatDateLong } from "@/lib/booking/time";
import { useBookableDates } from "@/lib/booking/useBookableDates";
import { useSiteContent } from "@/lib/content/context";
import { STEPS, type BookingController } from "@/lib/booking/useBooking";
import { cn } from "@/lib/cn";
import { formatDuration, formatPrice, formatTime } from "@/lib/format";
import { fill } from "@/lib/template";

const copy = contentConfig.booking;
/** Dates shown before "Show more dates" */
const INITIAL_DATES = 14;

/* ── Step 1: services ─────────────────────────────────────────────── */

export function ServicesStep({ booking }: { booking: BookingController }) {
  const { serviceCategories, services, booking: bookingConfig } = useSiteContent();
  const chosen = booking.values.serviceIds;
  const atMax = chosen.length >= bookingConfig.maxServicesPerBooking;
  const error = booking.form.formState.errors.serviceIds?.message;

  return (
    <div>
      <p className="text-sm text-muted">{fill(copy.maxServicesNote, { max: String(bookingConfig.maxServicesPerBooking) })}</p>
      <div className="mt-5 flex flex-col gap-6">
        {serviceCategories.map((cat) => {
          const list = services.filter((s) => s.category === cat.id);
          if (!list.length) return null;
          return (
            <fieldset key={cat.id}>
              <legend className="eyebrow mb-3">{cat.label}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {list.map((s) => {
                  const checked = chosen.includes(s.id);
                  const disabled = !checked && atMax;
                  return (
                    <label
                      key={s.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors duration-300",
                        checked ? "border-ink bg-ink text-bg" : "border-line bg-bg hover:border-ink/40",
                        disabled && "cursor-not-allowed opacity-45",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => booking.toggleService(s.id)}
                      />
                      <span
                        aria-hidden
                        className={cn(
                          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                          checked ? "border-bg bg-bg text-ink" : "border-ink/30",
                        )}
                      >
                        {checked && (
                          <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m2.5 6.5 2.2 2.2 4.8-5" />
                          </svg>
                        )}
                      </span>
                      <span className="flex flex-1 flex-col gap-1">
                        <span className="font-medium leading-snug">{s.name}</span>
                        <span className={cn("text-xs", checked ? "text-bg/70" : "text-muted")}>
                          {formatDuration(s.durationMinutes)} · {formatPrice(s.price, s.priceFrom)}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>
      <FieldError message={error} />
    </div>
  );
}

/* ── Step 2: date ─────────────────────────────────────────────────── */

export function DateStep({ booking }: { booking: BookingController }) {
  const { booking: rules } = useSiteContent();
  const [showAll, setShowAll] = useState(false);
  const dates = useBookableDates(rules);
  const shown = showAll ? dates : dates.slice(0, INITIAL_DATES);
  const error = booking.form.formState.errors.date?.message;

  return (
    <div>
      <div role="group" aria-label={copy.steps.date} className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7">
        {shown.map((d) => {
          const p = dateParts(d, siteConfig.locale);
          const active = booking.values.date === d;
          return (
            <button
              key={d}
              type="button"
              aria-pressed={active}
              aria-label={formatDateLong(d, siteConfig.locale)}
              onClick={() => booking.selectDate(d)}
              className={cn(
                "flex flex-col items-center rounded-2xl border px-2 py-3 transition-colors duration-300",
                active ? "border-ink bg-ink text-bg" : "border-line bg-bg hover:border-ink/40",
              )}
            >
              <span className={cn("text-[0.7rem] uppercase tracking-[0.14em]", active ? "text-bg/70" : "text-muted")}>
                {p.weekday}
              </span>
              <span className="font-serif text-2xl leading-tight">{p.day}</span>
              <span className={cn("text-xs", active ? "text-bg/70" : "text-muted")}>{p.month}</span>
            </button>
          );
        })}
      </div>
      {!showAll && dates.length > INITIAL_DATES && (
        <button type="button" onClick={() => setShowAll(true)} className="link-underline mt-5 text-sm text-accent">
          {copy.moreDates}
        </button>
      )}
      <FieldError message={error} />
    </div>
  );
}

/* ── Step 3: time ─────────────────────────────────────────────────── */

export function TimeStep({ booking }: { booking: BookingController }) {
  const { booking: bookingConfig } = useSiteContent();
  const error = booking.form.formState.errors.time?.message;

  if (booking.availabilityLoading) {
    return (
      <div aria-live="polite">
        <p className="sr-only">{copy.slots.loading}</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-line" />
          ))}
        </div>
      </div>
    );
  }

  if (booking.availabilityError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="text-muted">{copy.slots.error}</p>
        <button type="button" onClick={booking.retryAvailability} className="link-underline text-sm text-accent">
          {copy.slots.retry}
        </button>
      </div>
    );
  }

  const open = booking.slots.filter((s) => s.available);
  if (!open.length) return <p className="text-muted">{copy.slots.none}</p>;

  return (
    <div>
      <div role="group" aria-label={copy.steps.time} className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {booking.slots.map((slot) => {
          const active = booking.values.time === slot.time;
          // Only worth mentioning once a slot is partly booked and nearly full.
          const fewLeft =
            slot.remaining !== null &&
            slot.remaining > 0 &&
            slot.remaining < bookingConfig.maxBookingsPerSlot &&
            slot.remaining <= 2;
          return (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.available}
              aria-pressed={active}
              onClick={() => booking.selectTime(slot.time)}
              className={cn(
                "relative flex h-12 flex-col items-center justify-center rounded-xl border text-sm transition-colors duration-300",
                active ? "border-ink bg-ink text-bg" : "border-line bg-bg hover:border-ink/40",
                !slot.available && "cursor-not-allowed text-muted line-through opacity-50 hover:border-line",
              )}
            >
              {formatTime(slot.time)}
              {!slot.available && <span className="sr-only">{copy.slots.full}</span>}
              {fewLeft && (
                <span className={cn("text-[0.6rem] uppercase tracking-wider", active ? "text-bg/70" : "text-accent")}>
                  {fill(copy.slots.left, { count: String(slot.remaining) })}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <FieldError message={error} />
    </div>
  );
}

/* ── Step 4: details ──────────────────────────────────────────────── */

export function DetailsStep({ booking }: { booking: BookingController }) {
  const { register, formState } = booking.form;
  const e = formState.errors;
  const f = copy.fields;

  return (
    <div className="flex flex-col gap-5">
      <Field id="booking-name" label={f.name} error={e.name?.message}>
        <input
          id="booking-name"
          type="text"
          autoComplete="name"
          placeholder={f.namePlaceholder}
          aria-invalid={!!e.name}
          aria-describedby={e.name ? "booking-name-error" : undefined}
          className={inputClass(!!e.name)}
          {...register("name")}
        />
      </Field>

      <Field id="booking-phone" label={f.phone} error={e.phone?.message}>
        <div className={cn(inputClass(!!e.phone), "flex items-center gap-2 focus-within:border-ink")}>
          <span className="text-muted">+91</span>
          <input
            id="booking-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder={f.phonePlaceholder}
            aria-invalid={!!e.phone}
            aria-describedby={e.phone ? "booking-phone-error" : undefined}
            className="w-full bg-transparent outline-none"
            {...register("phone")}
          />
        </div>
      </Field>

      <Field id="booking-notes" label={f.notes} error={e.notes?.message}>
        <textarea
          id="booking-notes"
          rows={3}
          placeholder={f.notesPlaceholder}
          aria-invalid={!!e.notes}
          className={cn(inputClass(!!e.notes), "resize-none py-3")}
          {...register("notes")}
        />
      </Field>

      {/* Honeypot: invisible to people and screen readers; bots tend to fill every field. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="booking-website">Website</label>
        <input id="booking-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
    </div>
  );
}

/* ── Step 5: confirm ──────────────────────────────────────────────── */

export function ConfirmStep({ booking }: { booking: BookingController }) {
  const v = booking.form.getValues();
  const s = copy.summary;
  const rows: { label: string; value: ReactNode; step: number }[] = [
    { label: s.services, value: booking.selected.map((x) => x.name).join(", "), step: 0 },
    { label: s.date, value: formatDateLong(v.date, siteConfig.locale), step: 1 },
    { label: s.time, value: formatTime(v.time), step: 2 },
    { label: copy.fields.name, value: v.name, step: 3 },
    { label: copy.fields.phone, value: formatPhoneDisplay(v.phone), step: 3 },
  ];
  if (v.notes) rows.push({ label: copy.fields.notes, value: v.notes, step: 3 });

  return (
    <div>
      <dl className="divide-y divide-line border-y border-line">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 py-4 text-sm">
            <dt className="w-28 shrink-0 text-muted">{row.label}</dt>
            <dd className="flex-1">{row.value}</dd>
            <button type="button" onClick={() => booking.goTo(row.step)} className="link-underline shrink-0 text-accent">
              {copy.edit}
            </button>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex items-baseline justify-between">
        <span className="text-sm text-muted">
          {s.total} · {formatDuration(booking.totalMinutes)}
        </span>
        <span className="font-serif text-3xl">{formatPrice(booking.totalPrice, booking.fromPrice)}</span>
      </div>
    </div>
  );
}

/* ── Progress indicator ───────────────────────────────────────────── */

export function StepIndicator({ booking }: { booking: BookingController }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-3">
      {STEPS.map((key, i) => {
        const done = i < booking.stepIndex;
        const current = i === booking.stepIndex;
        return (
          <li key={key} className="flex flex-1 items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              disabled={!done}
              onClick={() => booking.goTo(i)}
              aria-current={current ? "step" : undefined}
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full border text-xs transition-colors duration-500",
                current && "border-ink bg-ink text-bg",
                done && "border-accent bg-accent text-accent-contrast hover:opacity-85",
                !current && !done && "border-line text-muted",
              )}
            >
              {done ? (
                <svg aria-hidden viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m2.5 6.5 2.2 2.2 4.8-5" />
                </svg>
              ) : (
                i + 1
              )}
              <span className="sr-only">{copy.steps[key]}</span>
            </button>
            <span className={cn("hidden text-xs lg:inline", current ? "text-ink" : "text-muted")}>{copy.steps[key]}</span>
            {i < STEPS.length - 1 && (
              <span aria-hidden className="h-px flex-1 bg-line">
                <span className={cn("block h-full origin-left bg-accent transition-transform duration-700", done ? "scale-x-100" : "scale-x-0")} />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ── Shared bits ──────────────────────────────────────────────────── */

const inputClass = (invalid: boolean) =>
  cn(
    "h-13 w-full rounded-xl border bg-bg px-4 text-base outline-none transition-colors placeholder:text-muted/60 focus:border-ink",
    invalid ? "border-accent" : "border-line",
  );

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-4 text-sm text-accent">
      {message}
    </p>
  );
}
