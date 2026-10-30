"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { contentConfig } from "@/config/content.config";
import { EASE_OUT } from "@/lib/motion";
import { getDefaultWhatsAppLink } from "@/lib/whatsapp";
import { useSiteContent } from "@/lib/content/context";

/**
 * Floating "chat on WhatsApp" button (bottom-right), pre-filled with
 * `siteConfig.contact.whatsappMessage`. Appears once the visitor scrolls past most of the hero,
 * so it never competes with the hero CTAs, and hides over the booking form. Desktop hover shows a label.
 */
export function WhatsAppButton() {
  const { site } = useSiteContent();
  const [visible, setVisible] = useState(false);
  const label = contentConfig.ui.chatOnWhatsApp;

  // Step aside while the booking form is on screen, so it never covers the form's buttons.
  const [overBooking, setOverBooking] = useState(false);
  useEffect(() => {
    const booking = document.getElementById("booking");
    if (!booking) return;
    const io = new IntersectionObserver(([entry]) => setOverBooking(entry?.isIntersecting ?? false), {
      rootMargin: "0px 0px -20% 0px",
    });
    io.observe(booking);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && !overBooking && (
        <motion.a
          href={getDefaultWhatsAppLink(site)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="group fixed bottom-5 right-5 z-[60] flex items-center md:bottom-8 md:right-8"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <span className="pointer-events-none mr-3 hidden translate-x-2 rounded-full bg-ink px-4 py-2 text-xs text-bg opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100 md:block">
            {label}
          </span>
          <span className="relative grid size-14 place-items-center rounded-full bg-whatsapp text-white shadow-[0_12px_30px_-8px_rgba(0,0,0,0.35)] transition-transform duration-500 ease-out-expo group-hover:scale-105">
            {/* Soft attention pulse (CSS animation, disabled by reduced motion) */}
            <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-whatsapp opacity-25 [animation-duration:2.6s]" />
            <svg aria-hidden viewBox="0 0 24 24" className="relative size-7" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3Z" />
            </svg>
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
