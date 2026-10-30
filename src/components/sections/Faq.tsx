"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { contentConfig } from "@/config/content.config";
import { useSiteContent } from "@/lib/content/context";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";
import { getDefaultWhatsAppLink } from "@/lib/whatsapp";
import { ArrowIcon } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * FAQ accordion (one item open at a time).
 * Desktop: the heading column is sticky while the questions scroll past it.
 * Answers open with a height + fade animation; the plus icon turns into a minus.
 * ARIA: each question is a button with aria-expanded/aria-controls; answers are labelled regions.
 */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();
  const copy = contentConfig.faq;
  const { faq, site } = useSiteContent();

  return (
    <section id="faq" aria-labelledby="faq-title" className="section-pad relative bg-bg">
      <div className="container-site grid gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-20">
        <div className="md:sticky md:top-32 md:self-start">
          <SectionHeading id="faq-title" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
          <p className="mt-8 max-w-xs text-sm text-muted">{copy.ctaText}</p>
          <a
            href={getDefaultWhatsAppLink(site)}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-3 inline-flex items-center gap-2 text-sm text-accent"
          >
            <span className="link-underline">{copy.ctaLabel}</span>
            <ArrowIcon />
          </a>
        </div>

        <ul className="border-t border-line">
          {faq.map((item, i) => {
            const isOpen = open === i;
            const buttonId = `${baseId}-q${i}`;
            const panelId = `${baseId}-a${i}`;
            return (
              <Reveal as="li" key={item.question} delay={i * 0.05} className="border-b border-line">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left font-serif text-[clamp(1.35rem,1.1rem+0.8vw,1.85rem)] leading-snug md:py-8"
                  >
                    {item.question}
                    <span
                      aria-hidden
                      className={cn(
                        "relative grid size-10 shrink-0 place-items-center rounded-full border border-line transition-colors duration-300 group-hover:border-ink/40",
                        isOpen && "border-ink bg-ink text-bg",
                      )}
                    >
                      <span className="absolute h-px w-3.5 bg-current" />
                      <span
                        className={cn(
                          "absolute h-3.5 w-px bg-current transition-transform duration-500 ease-out-expo",
                          isOpen && "rotate-90 scale-y-0",
                        )}
                      />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.55, ease: EASE_OUT }}
                    >
                      <p className="max-w-xl pb-8 pr-12 leading-relaxed text-muted">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
