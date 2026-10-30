import { contentConfig } from "@/config/content.config";
import type { SiteContent } from "@/lib/content/types";
import { getOpeningHoursRows } from "@/lib/hours";
import { getBookingHref } from "@/lib/sections";
import { SOCIAL_LABELS } from "@/lib/socials";
import { getDefaultWhatsAppLink } from "@/lib/whatsapp";
import { ArrowIcon, ButtonLink } from "@/components/ui/Button";
import { FooterWordmark } from "./FooterWordmark";

/**
 * Footer: closing statement + CTAs, contact/hours/socials/map grid,
 * the giant scroll-revealed wordmark, and the legal/credit bar.
 * Opening hours come from the same booking rules as the form, so they can never disagree.
 */
export function Footer({ content }: { content: SiteContent }) {
  const { site: siteConfig, booking } = content;
  const { contact, socials, credit, fullName } = siteConfig;
  const { footer, ui } = contentConfig;
  const whatsappHref = getDefaultWhatsAppLink(siteConfig);
  const bookHref = getBookingHref(whatsappHref, siteConfig.sections);
  const hours = getOpeningHoursRows(ui.closed, booking.weeklyHours);
  const a = contact.address;
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="relative overflow-hidden border-t border-line bg-bg-alt">
      {/* Soft glow in the top corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 size-[36rem] rounded-full bg-glow/60 blur-[120px]"
      />

      <div className="container-site relative pt-24 md:pt-32">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-[14ch] text-headline">{footer.headline}</h2>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={bookHref} magnetic>
              {siteConfig.bookCtaLabel}
              <ArrowIcon />
            </ButtonLink>
            <ButtonLink href={whatsappHref} variant="outline" magnetic target="_blank" rel="noopener noreferrer">
              {ui.whatsapp}
            </ButtonLink>
          </div>
        </div>

        <div className="mt-20 grid gap-12 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.8fr_1.4fr]">
          <address className="flex flex-col gap-3 not-italic">
            <h3 className="eyebrow">{footer.visitTitle}</h3>
            <p className="leading-relaxed">
              {a.line1}
              {a.line2 && (
                <>
                  <br />
                  {a.line2}
                </>
              )}
              <br />
              {a.city}, {a.region} {a.postalCode}
            </p>
            <a
              href={contact.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-fit items-center gap-1.5 text-sm text-accent"
            >
              <span className="link-underline">{footer.directionsLabel}</span>
              <ArrowIcon />
            </a>
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="link-underline w-fit">
                <span className="sr-only">{ui.call}: </span>
                {contact.phone}
              </a>
              <a href={`mailto:${contact.email}`} className="link-underline w-fit">
                <span className="sr-only">{ui.email}: </span>
                {contact.email}
              </a>
            </div>
          </address>

          <div className="flex flex-col gap-3">
            <h3 className="eyebrow">{footer.hoursTitle}</h3>
            <dl className="flex flex-col gap-2 text-sm">
              {hours.map((row) => (
                <div key={row.days} className="flex justify-between gap-4 border-b border-line pb-2">
                  <dt className="text-muted">{row.days}</dt>
                  <dd>{row.hours}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="eyebrow">{footer.followTitle}</h3>
            <ul className="flex flex-col gap-2">
              {socials.map((s) => (
                <li key={s.platform}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5"
                  >
                    <span className="link-underline">{s.label ?? SOCIAL_LABELS[s.platform]}</span>
                    <ArrowIcon className="opacity-50" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Map: lazy-loaded so it never costs anything until the visitor scrolls here */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-line sm:col-span-2 lg:col-span-1">
            <iframe
              src={contact.mapsEmbedUrl}
              title={`${fullName} — ${footer.visitTitle}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full grayscale-[0.6] sepia-[0.15]"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      <div className="mt-20">
        <FooterWordmark />
      </div>

      <div className="container-site flex flex-col gap-2 border-t border-line py-6 text-xs text-muted sm:flex-row sm:justify-between">
        <p>
          © {year} {fullName}. {footer.copyright}
        </p>
        {credit.show && (
          <p>
            {credit.prefix}{" "}
            <a href={credit.url} target="_blank" rel="noopener" className="link-underline text-ink">
              {credit.name}
            </a>
          </p>
        )}
      </div>
    </footer>
  );
}
