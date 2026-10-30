"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { contentConfig } from "@/config/content.config";
import { cn } from "@/lib/cn";
import { EASE_IN_OUT, EASE_OUT } from "@/lib/motion";
import { getBookingHref, getNavItems, sectionHref, TOP_ID } from "@/lib/sections";
import { scrollToTarget, useSmoothScroll } from "@/lib/scroll/useSmoothScroll";
import { SOCIAL_LABELS } from "@/lib/socials";
import { getDefaultWhatsAppLink } from "@/lib/whatsapp";
import { useSiteContent } from "@/lib/content/context";
import { ArrowIcon, ButtonLink } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";

const MENU_ID = "mobile-menu";

/**
 * Sticky navbar.
 * - Transparent over the hero, frosted glass once the page has scrolled.
 * - Slides away when scrolling down, returns on any upward scroll.
 * - Highlights the link of the section currently in view.
 * - Below `lg`: burger opens a full-screen menu (circular clip-path reveal + staggered links).
 * The "Book" CTA is visible at every breakpoint.
 */
export function Navbar() {
  const { ui } = contentConfig;
  const { site: siteConfig } = useSiteContent();
  const navItems = useMemo(() => getNavItems(siteConfig.sections), [siteConfig.sections]);
  const bookHref = getBookingHref(getDefaultWhatsAppLink(siteConfig), siteConfig.sections);
  const bookIsExternal = bookHref.startsWith("http");

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const lastY = useRef(0);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { lock, unlock } = useSmoothScroll();

  // Scroll state, throttled to one update per frame.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY.current;
      setScrolled(y > 24);
      if (Math.abs(delta) > 4) setHidden(delta > 0 && y > 160);
      lastY.current = y;
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

  // Active section: the one crossing the middle band of the viewport.
  useEffect(() => {
    const targets = navItems
      .map((i) => document.getElementById(i.section))
      .filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [navItems]);

  // Menu open: lock scroll, close on Escape, trap focus, restore focus on close.
  useEffect(() => {
    if (!open) return;
    lock();
    const burger = burgerRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab" || !menuRef.current) return;
      const focusables = [
        burger,
        ...menuRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      ].filter((el): el is HTMLElement => el !== null);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      unlock();
      burger?.focus({ preventScroll: true });
    };
  }, [open, lock, unlock]);

  /** Mobile menu link: unlock scrolling first, then glide to the section. */
  const onMenuLinkClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    unlock();
    setOpen(false);
    scrollToTarget(target);
  };

  const glass = scrolled && !open;

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-transform duration-700 ease-out-expo",
        hidden && !open ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <div
        className={cn(
          "border-b transition-[background-color,border-color,backdrop-filter] duration-500",
          glass ? "border-line bg-bg/70 backdrop-blur-xl backdrop-saturate-150" : "border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label={ui.primaryNav}
          className="container-site relative z-10 flex h-[var(--nav-height)] items-center justify-between gap-4"
        >
          <a href={`#${TOP_ID}`} className="shrink-0" aria-label={siteConfig.fullName}>
            <Wordmark name={siteConfig.name} logo={siteConfig.logo} />
          </a>

          <ul className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <li key={item.section}>
                <a
                  href={sectionHref(item.section)}
                  aria-current={active === item.section ? "true" : undefined}
                  className="link-underline py-1 text-sm tracking-wide text-ink/80 transition-colors hover:text-ink aria-[current=true]:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <ButtonLink
              href={bookHref}
              size="sm"
              magnetic
              {...(bookIsExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {siteConfig.bookCtaLabel}
              <ArrowIcon />
            </ButtonLink>

            <button
              ref={burgerRef}
              type="button"
              className="relative grid size-10 place-items-center rounded-full border border-ink/20 lg:hidden"
              aria-expanded={open}
              aria-controls={MENU_ID}
              aria-label={open ? ui.closeMenu : ui.openMenu}
              onClick={() => setOpen((v) => !v)}
            >
              {/* Two hairlines that rotate into an X */}
              <span
                aria-hidden
                className={cn(
                  "absolute h-px w-4.5 bg-ink transition-transform duration-500 ease-out-expo",
                  open ? "rotate-45" : "-translate-y-[3px]",
                )}
              />
              <span
                aria-hidden
                className={cn(
                  "absolute h-px w-4.5 bg-ink transition-transform duration-500 ease-out-expo",
                  open ? "-rotate-45" : "translate-y-[3px]",
                )}
              />
            </button>
          </div>
        </nav>
      </div>
    </header>

      {/* Rendered outside <header>: its transform would otherwise trap `position: fixed`. */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            id={MENU_ID}
            role="dialog"
            aria-modal="true"
            aria-label={ui.primaryNav}
            className="fixed inset-0 z-40 flex flex-col bg-bg-alt pt-[var(--nav-height)] lg:hidden"
            // Circular reveal expanding from the burger button (top-right).
            initial={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.25rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 2.5rem) 2.25rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.25rem)" }}
            transition={{ duration: 0.8, ease: EASE_IN_OUT }}
          >
            <div className="container-site flex flex-1 flex-col justify-between overflow-y-auto pb-8 pt-6">
              <ul className="flex flex-col gap-1">
                {navItems.map((item, i) => (
                  <li key={item.section} className="mask-line">
                    <motion.a
                      href={sectionHref(item.section)}
                      onClick={(e) => onMenuLinkClick(e, item.section)}
                      className="flex items-baseline gap-4 py-1 font-serif text-[clamp(2.5rem,11vw,4.5rem)] leading-[1.05] text-ink"
                      // Each link rises out of its own mask, staggered top to bottom.
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      exit={{ y: "110%" }}
                      transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.2 + i * 0.06 }}
                    >
                      <span className="font-sans text-xs tracking-widest text-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item.label}
                    </motion.a>
                  </li>
                ))}
              </ul>

              <motion.div
                className="mt-10 flex flex-col gap-6 border-t border-line pt-6 text-sm"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.45 }}
              >
                <div className="flex flex-col gap-1 text-muted">
                  <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`} className="text-ink">
                    {siteConfig.contact.phone}
                  </a>
                  <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
                </div>
                <ul className="flex flex-wrap gap-x-5 gap-y-2">
                  {siteConfig.socials.map((s) => (
                    <li key={s.platform}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-underline">
                        {s.label ?? SOCIAL_LABELS[s.platform]}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
