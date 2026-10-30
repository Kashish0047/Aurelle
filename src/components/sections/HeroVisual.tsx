"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { contentConfig } from "@/config/content.config";
import { siteConfig } from "@/config/site.config";
import { useHasFinePointer, useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useIsLowEnd } from "@/lib/hooks/useIsLowEnd";
import { usePointerRef } from "@/lib/hooks/usePointerRef";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useWebGLTier } from "@/lib/hooks/useWebGLTier";
import { SceneFallback } from "@/components/three/SceneFallback";
import type { SceneInputs } from "@/components/three/types";

// three.js + R3F live in their own chunk, fetched only when the 3D hero is actually used.
const BeautyCanvas = dynamic(() => import("@/components/three/BeautyCanvas"), { ssr: false });

/**
 * Picks the hero background from `siteConfig.heroVariant`:
 *  - "3d-scene": CSS gradient placeholder first, then the procedural beauty scene ("lite" on
 *                low-end devices). Phones (unless features.mobile3d) and reduced-motion visitors
 *                get heroScene.fallbackImage instead and never download three.js. Devices without
 *                hardware-accelerated WebGL keep the gradient (software rendering would freeze the page).
 *  - "image":     a single optimised image with an organic arch mask
 *  - "video":     muted looping video (poster only for reduced motion)
 */
export function HeroVisual({ scroll }: Pick<SceneInputs, "scroll">) {
  const reducedMotion = useReducedMotion();
  const lowEnd = useIsLowEnd();
  const finePointer = useHasFinePointer();
  const isPhone = useMediaQuery("(max-width: 767px)");
  const idle = useIdleAfterLoad();
  const { hero } = contentConfig;
  const variant = siteConfig.heroVariant;
  // Only probe the GPU once the page is idle and 3D is actually wanted on this device.
  const wants3d = variant === "3d-scene" && !reducedMotion && (!isPhone || siteConfig.features.mobile3d);
  const webgl = useWebGLTier(idle && wants3d);

  // Pointer parallax only where it makes sense: desktop, motion allowed, 3D variant.
  const pointer = usePointerRef(variant === "3d-scene" && finePointer && !reducedMotion);

  if (variant === "image" || (variant === "video" && (reducedMotion || !hero.video))) {
    return (
      <div className="absolute inset-y-[12%] right-[4%] hidden w-[38%] overflow-hidden rounded-t-full rounded-b-[2rem] md:block">
        <Image src={hero.image.src} alt={hero.image.alt} fill priority sizes="40vw" className="object-cover" />
      </div>
    );
  }

  if (variant === "video" && hero.video) {
    return (
      <div className="absolute inset-0">
        <video
          className="size-full object-cover opacity-90"
          src={hero.video.src}
          poster={hero.video.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
      </div>
    );
  }

  const show3d = wants3d && webgl === "hardware";

  return (
    <div className="absolute inset-0">
      <SceneFallback />
      {show3d && (
        <BeautyCanvas mode="hero" quality={lowEnd ? "lite" : "high"} scroll={scroll} pointer={pointer} />
      )}
    </div>
  );
}

/**
 * True once the page has loaded and the browser has a quiet moment. The 3D scene is mounted only
 * then, so downloading/initialising three.js never competes with the first paint or hydration.
 */
function useIdleAfterLoad(): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const hasIdleCallback = typeof window.requestIdleCallback === "function";
    let handle = 0;
    const whenIdle = () => {
      handle = hasIdleCallback
        ? window.requestIdleCallback(() => setIdle(true), { timeout: 2000 })
        : window.setTimeout(() => setIdle(true), 300);
    };
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
    return () => {
      window.removeEventListener("load", whenIdle);
      if (hasIdleCallback) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, []);
  return idle;
}
