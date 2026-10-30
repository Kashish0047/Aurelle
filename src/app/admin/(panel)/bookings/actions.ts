"use server";

import { z } from "zod";
import { bookingConfig } from "@/config/booking.config";
import { BOOKING_STATUSES } from "@/lib/admin/booking-status";
import { uuid } from "@/lib/admin/fields";
import type { ActionResult } from "@/lib/admin/result";
import { adminMutation, friendlyError } from "@/lib/admin/server";

const statusChange = z.object({ id: uuid, status: z.enum(BOOKING_STATUSES) });

/**
 * Changes a booking's status. Re-opening a cancelled booking needs its seat back, so the
 * database checks the slot still has room (admin_set_booking_status, under the slot lock).
 */
export async function setBookingStatus(input: unknown): Promise<ActionResult> {
  return adminMutation(
    statusChange,
    input,
    async ({ id, status }, session) => {
      const { data, error } = await session.supabase.rpc("admin_set_booking_status", {
        p_id: id,
        p_status: status,
        p_max_per_slot: bookingConfig.maxBookingsPerSlot,
      });
      if (error) return { ok: false, error: friendlyError(error, "change booking status") };
      const result = data as { ok: boolean; error?: string };
      if (result.error === "slot_full") {
        return { ok: false, error: "That time is fully booked now, so this booking can't be re-opened. Offer the client another time." };
      }
      if (result.error === "not_found") return { ok: false, error: "This booking no longer exists. Please reload the page." };
      return { ok: true, id };
    },
    { tags: [], paths: ["/admin/bookings", "/admin"] },
  );
}
