/** Booking statuses, shared by the admin UI and the server. Pending and confirmed hold a seat; cancelled frees it. */
export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "no_show", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Waiting for you",
  confirmed: "Confirmed",
  completed: "Completed",
  no_show: "No-show",
  cancelled: "Cancelled",
};

export const STATUS_STYLE: Record<BookingStatus, string> = {
  pending: "bg-gold/20 text-ink border-gold/60",
  confirmed: "bg-ink text-bg border-ink",
  completed: "bg-bg-alt text-muted border-line",
  no_show: "bg-accent/15 text-ink border-accent/40",
  cancelled: "bg-bg-alt text-muted border-line line-through",
};
