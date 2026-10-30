import Image from "next/image";
import { siteConfig } from "@/config/site.config";
import type { SiteConfig } from "@/config/types";
import { cn } from "@/lib/cn";

/** Brand mark: the logo image if configured, otherwise the name set in the serif font. */
export function Wordmark({
  className,
  name = siteConfig.name,
  logo = siteConfig.logo,
}: {
  className?: string;
  name?: string;
  logo?: SiteConfig["logo"];
}) {
  if (logo) {
    return (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        priority
        className={cn("h-8 w-auto object-contain object-left", className)}
      />
    );
  }
  return (
    <span className={cn("font-serif text-[1.65rem] leading-none tracking-tight", className)}>
      {name}
      <span className="text-accent">.</span>
    </span>
  );
}
