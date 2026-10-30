"use client";

/**
 * Hand-off between "Book this" buttons (services, etc.) and the booking form.
 * The button calls `preselectService(id)`; the form (useBooking) listens and pre-ticks
 * that service, then jumps to the date step.
 */
const EVENT = "booking:preselect";

export function preselectService(serviceId: string) {
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: serviceId }));
}

/** Subscribe to preselect requests. Returns an unsubscribe function. */
export function onServicePreselect(handler: (serviceId: string) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<string>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
