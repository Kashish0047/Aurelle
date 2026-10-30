"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BOOKING_STATUSES, STATUS_LABEL, STATUS_STYLE, type BookingStatus } from "@/lib/admin/booking-status";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/admin/Toaster";
import { useConfirm } from "@/components/admin/ui/ConfirmDialog";
import { setBookingStatus } from "./actions";

/** Status dropdown for one booking: changes instantly, rolls back with a message if saving fails. */
export function StatusPicker({ id, status, label }: { id: string; status: BookingStatus; label: string }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(status);

  const change = async (next: BookingStatus) => {
    if (next === status) return;
    if (next === "cancelled") {
      const ok = await confirm({
        title: "Cancel this booking?",
        message: "The time slot becomes free for other clients. Let the client know on WhatsApp.",
        confirmLabel: "Cancel booking",
        danger: true,
      });
      if (ok !== true) return;
    }
    startTransition(async () => {
      setShown(next);
      const result = await setBookingStatus({ id, status: next });
      if (result.ok) {
        toast(`Marked as ${STATUS_LABEL[next].toLowerCase()}`);
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  return (
    <select
      aria-label={`Status for ${label}`}
      value={shown}
      disabled={pending}
      onChange={(e) => void change(e.target.value as BookingStatus)}
      className={cn("h-9 rounded-full border px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-ink/30 disabled:opacity-60", STATUS_STYLE[shown])}
    >
      {BOOKING_STATUSES.map((s) => (
        <option key={s} value={s} className="bg-surface text-ink no-underline">
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
