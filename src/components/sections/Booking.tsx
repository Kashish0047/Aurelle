"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { contentConfig } from "@/config/content.config";
import { gsap, useGSAP } from "@/lib/gsap";
import { useBooking } from "@/lib/booking/useBooking";
import { EASE_OUT } from "@/lib/motion";
import { scrollToTarget } from "@/lib/scroll/useSmoothScroll";
import { getDefaultWhatsAppLink } from "@/lib/whatsapp";
import { useSiteContent } from "@/lib/content/context";
import { BookingSuccess } from "@/components/booking/BookingSuccess";
import { BookingSummary } from "@/components/booking/BookingSummary";
import {
  ConfirmStep,
  DateStep,
  DetailsStep,
  ServicesStep,
  StepIndicator,
  TimeStep,
} from "@/components/booking/BookingSteps";
import { ArrowIcon, Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEP_COMPONENTS = {
  services: ServicesStep,
  date: DateStep,
  time: TimeStep,
  details: DetailsStep,
  confirm: ConfirmStep,
} as const;

/**
 * Booking — the primary conversion section.
 * Scroll: the form card "unfolds" toward the viewer (rotateX + rise, scrubbed) as it enters.
 * Steps slide horizontally in the direction of travel; focus moves to each step's title.
 * Works with JS-only features off: no 3D or animation is required to book.
 */
export function Booking() {
  const { site: siteConfig } = useSiteContent();
  const root = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const stepTitle = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const booking = useBooking();
  const copy = contentConfig.booking;
  const Step = STEP_COMPONENTS[booking.step];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".booking-card",
          // No opacity fade: the form's text must keep full contrast at every scroll position.
          { rotateX: 14, yPercent: 10, transformPerspective: 1400, transformOrigin: "50% 100%" },
          {
            rotateX: 0,
            yPercent: 0,
            ease: "none",
            scrollTrigger: { trigger: ".booking-card", start: "top 95%", end: "top 45%", scrub: 0.6 },
          },
        );
      });
    },
    { scope: root },
  );

  // On step change: focus the new step title and bring the card top into view if needed.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    stepTitle.current?.focus({ preventScroll: true });
    const el = card.current;
    if (el && el.getBoundingClientRect().top < 0) scrollToTarget(el, { offset: -96 });
  }, [booking.stepIndex]);

  const isLast = booking.step === "confirm";

  return (
    <section ref={root} id="booking" aria-labelledby="booking-title" className="section-pad relative overflow-hidden bg-bg-alt">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-1/4 size-[40rem] rounded-full bg-glow/40 blur-[140px]" />

      <div className="container-site relative grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading id="booking-title" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
          <BookingSummary booking={booking} className="mt-10 hidden lg:block" />
          <p className="mt-8 text-sm text-muted">
            <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`} className="link-underline text-ink">
              {siteConfig.contact.phone}
            </a>
            {" · "}
            <a href={getDefaultWhatsAppLink(siteConfig)} target="_blank" rel="noopener noreferrer" className="link-underline text-ink">
              {contentConfig.ui.whatsapp}
            </a>
          </p>
        </div>

        <div ref={card} className="booking-card relative rounded-[2rem] border border-line bg-surface p-5 shadow-[0_40px_120px_-60px_var(--glow)] sm:p-8 md:p-10">
          {booking.success ? (
            <BookingSuccess result={booking.success} onReset={booking.reset} />
          ) : (
            <form onSubmit={booking.submit} noValidate>
              <StepIndicator booking={booking} />

              <div className="relative mt-8 overflow-hidden">
                <AnimatePresence mode="wait" initial={false} custom={booking.direction}>
                  <motion.div
                    key={booking.step}
                    custom={booking.direction}
                    variants={{
                      enter: (d: number) => ({ x: d * 40, opacity: 0 }),
                      center: { x: 0, opacity: 1 },
                      exit: (d: number) => ({ x: d * -40, opacity: 0 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                  >
                    <h3 ref={stepTitle} tabIndex={-1} className="mb-6 font-serif text-3xl md:text-4xl">
                      {copy.stepTitles[booking.step]}
                    </h3>
                    <Step booking={booking} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {booking.submitError && (
                <p role="alert" className="mt-6 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
                  {booking.submitError}
                </p>
              )}

              <BookingSummary booking={booking} className="mt-8 lg:hidden" />

              <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
                <button
                  type="button"
                  onClick={booking.back}
                  className={booking.stepIndex === 0 ? "invisible" : "link-underline text-sm"}
                >
                  {copy.back}
                </button>
                {isLast ? (
                  <Button type="submit" disabled={booking.submitting} magnetic>
                    {booking.submitting ? copy.submitting : copy.submit}
                    {!booking.submitting && <ArrowIcon />}
                  </Button>
                ) : (
                  <Button type="button" onClick={booking.next} magnetic>
                    {copy.next}
                    <ArrowIcon />
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
