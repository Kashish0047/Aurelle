import Image from "next/image";
import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/cn";

/**
 * What sits under / instead of the 3D scene. Pure CSS switching (no JavaScript), so it is
 * correct on the very first paint:
 *
 *  - Static image (heroScene.fallbackImage) on phones (unless features.mobile3d) and for
 *    visitors who prefer reduced motion — the 3D engine is never downloaded for them.
 *  - Soft gradient glow everywhere else: a placeholder while the 3D loads, which then fades in
 *    on top. It also remains if WebGL is unavailable.
 */
export function SceneFallback() {
  const { heroScene, features } = siteConfig;
  const { primaryColor, accentColor, blobColor, fallbackImage } = heroScene;
  const phonesGetImage = !features.mobile3d;

  return (
    <>
      <div
        aria-hidden
        className={cn(
          "absolute left-1/2 top-[22%] size-[min(80vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl md:left-[70%] md:top-1/2 md:size-[min(44vw,40rem)]",
          // Gradient only where the 3D can run: motion allowed (and wide screens, unless mobile3d).
          phonesGetImage ? "hidden md:motion-safe:block" : "hidden motion-safe:block",
        )}
        style={{
          background: `radial-gradient(circle at 42% 40%, ${blobColor} 0%, transparent 62%),
            radial-gradient(circle at 62% 64%, color-mix(in srgb, ${primaryColor} 38%, transparent) 0%, transparent 58%),
            radial-gradient(circle at 30% 70%, color-mix(in srgb, ${accentColor} 35%, transparent) 0%, transparent 55%)`,
        }}
      />

      <div
        className={cn(
          "absolute left-1/2 top-[calc(var(--nav-height)+0.75rem)] aspect-[3/4] w-[min(40vw,10rem)] -translate-x-1/2 overflow-hidden rounded-t-full rounded-b-[1.5rem]",
          "md:left-auto md:right-[6%] md:top-1/2 md:w-[min(30vw,24rem)] md:translate-x-0 md:-translate-y-1/2",
          // Image everywhere else (phones without mobile3d, and reduced motion at any size).
          phonesGetImage ? "block md:motion-safe:hidden" : "block motion-safe:hidden",
        )}
      >
        <Image
          src={fallbackImage.src}
          alt={fallbackImage.alt}
          fill
          sizes="(min-width: 768px) 30vw, 40vw"
          // On phones this is the largest element above the fold: load it right away, not lazily.
          loading="eager"
          fetchPriority="high"
          className="object-cover"
        />
      </div>
    </>
  );
}
