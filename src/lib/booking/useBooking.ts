"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contentConfig } from "@/config/content.config";
import { useSiteContent } from "@/lib/content/context";
import { bookingSchema, type BookingFormValues } from "./schema";
import { onServicePreselect } from "./selection";
import { hasFromPrice, resolveServices, totals } from "./summary";
import type { AvailabilityResponse, BookingRecord, BookingStatus, BookResponse } from "./types";

export const STEPS = ["services", "date", "time", "details", "confirm"] as const;
export type StepKey = (typeof STEPS)[number];

/** Which form fields must be valid before leaving each step. */
const STEP_FIELDS: Record<StepKey, (keyof BookingFormValues)[]> = {
  services: ["serviceIds"],
  date: ["date"],
  time: ["time"],
  details: ["name", "phone", "notes"],
  confirm: [],
};

type AvailabilityState =
  | { key: string; status: "ready"; data: AvailabilityResponse }
  | { key: string; status: "error" };

export interface BookingSuccess {
  status: BookingStatus;
  booking: BookingRecord;
  actionUrl?: string;
}

const DEFAULTS: BookingFormValues = { serviceIds: [], date: "", time: "", name: "", phone: "", notes: "", website: "" };

/**
 * All booking-form state and behaviour in one hook; the UI components stay presentational.
 * - Multi-step navigation with per-step validation (React Hook Form + the shared Zod schema)
 * - Live availability for the chosen date + total duration (from /api/availability)
 * - Submission to /api/book with friendly errors (slot taken → back to the time step)
 * - Listens for "Book this" preselects coming from other sections
 */
export function useBooking() {
  const { services: catalog, booking: bookingConfig } = useSiteContent();
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: DEFAULTS,
    mode: "onTouched",
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [availability, setAvailability] = useState<AvailabilityState | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<BookingSuccess | null>(null);

  const serviceIds = useWatch({ control: form.control, name: "serviceIds" });
  const date = useWatch({ control: form.control, name: "date" });
  const time = useWatch({ control: form.control, name: "time" });

  const selected = useMemo(() => resolveServices(serviceIds, catalog), [serviceIds, catalog]);
  const { totalPrice, totalMinutes } = totals(selected);

  // ── Availability ────────────────────────────────────────────────────
  const availabilityKey = date ? `${date}|${totalMinutes}|${reloadToken}` : "";
  const availabilityLoading = availabilityKey !== "" && availability?.key !== availabilityKey;

  useEffect(() => {
    if (!availabilityKey) return;
    const controller = new AbortController();
    const duration = totalMinutes || bookingConfig.slotMinutes;
    fetch(`/api/availability?date=${date}&duration=${duration}`, { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<AvailabilityResponse>) : Promise.reject(new Error(String(res.status)))))
      .then((data) => setAvailability({ key: availabilityKey, status: "ready", data }))
      .catch((err: unknown) => {
        if ((err as Error).name !== "AbortError") setAvailability({ key: availabilityKey, status: "error" });
      });
    return () => controller.abort();
  }, [availabilityKey, date, totalMinutes, bookingConfig.slotMinutes]);

  const slots = availability?.key === availabilityKey && availability.status === "ready" ? availability.data.slots : [];
  const availabilityError = availability?.key === availabilityKey && availability.status === "error";
  const retryAvailability = () => setReloadToken((n) => n + 1);

  // ── Navigation ──────────────────────────────────────────────────────
  const step = STEPS[stepIndex]!;

  const goTo = useCallback(
    (index: number) => {
      setDirection(index >= stepIndex ? 1 : -1);
      setStepIndex(Math.max(0, Math.min(STEPS.length - 1, index)));
    },
    [stepIndex],
  );

  const next = async () => {
    const valid = await form.trigger(STEP_FIELDS[step]);
    if (!valid) return;
    if (step === "time" && !slots.some((s) => s.time === time && s.available)) {
      form.setError("time", { message: contentConfig.booking.errors.time });
      return;
    }
    goTo(stepIndex + 1);
  };
  const back = () => goTo(stepIndex - 1);

  // ── Field helpers ───────────────────────────────────────────────────
  const toggleService = (id: string) => {
    const current = form.getValues("serviceIds");
    const nextIds = current.includes(id)
      ? current.filter((s) => s !== id)
      : current.length < bookingConfig.maxServicesPerBooking
        ? [...current, id]
        : current;
    form.setValue("serviceIds", nextIds, { shouldValidate: true });
    // A different duration can change which times fit, so the chosen time is reset.
    form.setValue("time", "");
  };
  const selectDate = (value: string) => {
    form.setValue("date", value, { shouldValidate: true });
    form.setValue("time", "");
  };
  const selectTime = (value: string) => form.setValue("time", value, { shouldValidate: true });

  // "Book this" from another section → tick that service and go to the date step.
  useEffect(
    () =>
      onServicePreselect((id) => {
        if (!resolveServices([id], catalog).length) return;
        setSuccess(null);
        form.setValue("serviceIds", [id], { shouldValidate: true });
        form.setValue("time", "");
        goTo(1);
      }),
    [form, goTo, catalog],
  );

  // ── Submit ──────────────────────────────────────────────────────────
  const submit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    const errors = contentConfig.booking.errors;
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as BookResponse;
      if (data.ok) {
        setSuccess({ status: data.status, booking: data.booking, actionUrl: data.actionUrl });
        return;
      }
      if (data.error === "slot_full") {
        form.setValue("time", "");
        setSubmitError(errors.slotFull);
        retryAvailability();
        goTo(STEPS.indexOf("time"));
        return;
      }
      setSubmitError(data.error === "rate_limited" ? errors.rateLimited : errors.generic);
    } catch {
      setSubmitError(errors.generic);
    }
  });

  const reset = () => {
    form.reset(DEFAULTS);
    setSuccess(null);
    setSubmitError(null);
    goTo(0);
  };

  return {
    form,
    step,
    stepIndex,
    direction,
    goTo,
    next,
    back,
    values: { serviceIds, date, time },
    selected,
    totalPrice,
    totalMinutes,
    /** Any selected service has a "from" price, so the total is an estimate. */
    fromPrice: hasFromPrice(serviceIds, catalog),
    slots,
    mode: availability?.status === "ready" ? availability.data.mode : null,
    availabilityLoading,
    availabilityError,
    retryAvailability,
    toggleService,
    selectDate,
    selectTime,
    submit,
    submitting: form.formState.isSubmitting,
    submitError,
    success,
    reset,
  };
}

export type BookingController = ReturnType<typeof useBooking>;
