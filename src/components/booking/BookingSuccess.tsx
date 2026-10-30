"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { contentConfig } from "@/config/content.config";
import { siteConfig } from "@/config/site.config";
import { downloadIcs } from "@/lib/booking/ics";
import { formatBookingText } from "@/lib/booking/summary";
import { formatDateLong } from "@/lib/booking/time";
import type { BookingSuccess as Success } from "@/lib/booking/useBooking";
import { EASE_OUT } from "@/lib/motion";
import { formatTime } from "@/lib/format";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { useSiteContent } from "@/lib/content/context";
import { ArrowIcon, Button, ButtonLink } from "@/components/ui/Button";

/**
 * Success screen. The headline follows the status from /api/book (see bookingConfig.confirmationMode):
 *  - "confirmed" ("instant" mode + a provider that counts) → "You're booked!"
 *  - "requested" ("manual" mode, or a provider that can't count) → "Request received, we'll confirm on WhatsApp"
 *  - "requested" + actionUrl (whatsapp-link)     → "One last tap" + Send on WhatsApp
 * A check mark draws itself in; "Add to calendar" downloads an .ics file.
 */
export function BookingSuccess({ result, onReset }: { result: Success; onReset: () => void }) {
  const { site, services } = useSiteContent();
  const s = contentConfig.booking.success;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { booking, status, actionUrl } = result;

  const [title, text] =
    status === "confirmed"
      ? [s.confirmedTitle, s.confirmedText]
      : actionUrl
        ? [s.sendTitle, s.sendText]
        : [s.requestedTitle, s.requestedText];

  // Move focus to the result so screen readers announce it.
  useEffect(() => headingRef.current?.focus(), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className="flex flex-col items-center py-6 text-center"
    >
      <svg aria-hidden viewBox="0 0 64 64" className="size-20 text-accent">
        <motion.circle
          cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="1.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: EASE_OUT }}
        />
        <motion.path
          d="M20 33.5 28 41l16-17" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.6, ease: EASE_OUT }}
        />
      </svg>

      <h3 ref={headingRef} tabIndex={-1} className="mt-6 font-serif text-4xl" aria-live="polite">
        {title}
      </h3>
      <p className="mt-3 max-w-sm text-muted">{text}</p>

      <div className="mt-8 w-full max-w-sm rounded-2xl border border-line bg-bg p-5 text-left text-sm">
        <div className="flex justify-between">
          <span className="text-muted">{s.reference}</span>
          <span className="font-mono tracking-wider">{booking.id}</span>
        </div>
        <p className="mt-3 font-serif text-xl">{booking.services.map((x) => x.name).join(" + ")}</p>
        <p className="mt-1 text-muted">
          {formatDateLong(booking.date, siteConfig.locale)} · {formatTime(booking.time)}
        </p>
      </div>

      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        {actionUrl ? (
          <ButtonLink href={actionUrl} target="_blank" rel="noopener noreferrer" variant="accent" className="w-full">
            {s.sendCta}
            <ArrowIcon />
          </ButtonLink>
        ) : (
          <ButtonLink
            href={buildWhatsAppLink(formatBookingText(booking, site.name, services), site.contact.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            className="w-full"
          >
            {s.whatsappCta}
            <ArrowIcon />
          </ButtonLink>
        )}
        <Button onClick={() => downloadIcs(booking)} variant={actionUrl ? "outline" : "solid"} className="w-full">
          {s.addToCalendar}
        </Button>
        <button type="button" onClick={onReset} className="link-underline mx-auto mt-2 text-sm text-muted">
          {s.bookAnother}
        </button>
      </div>
    </motion.div>
  );
}
