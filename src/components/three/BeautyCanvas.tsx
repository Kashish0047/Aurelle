"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/cn";
import { BeautyScene } from "./BeautyScene";
import { SceneErrorBoundary } from "./SceneErrorBoundary";
import { StudioSetup } from "./StudioSetup";
import type { SceneInputs, SceneMode, SceneQuality } from "./types";

interface Props extends SceneInputs {
  quality: SceneQuality;
  mode: SceneMode;
  /** Services mode: category of each card along the track (drives the tint). */
  categories?: string[];
}

/**
 * WebGL canvas for the beauty scene (hero and services). Loaded with next/dynamic (ssr: false),
 * so three.js never blocks the first paint or the booking path.
 *
 * Lighting: a warm key light and a soft rim light (colours + intensity from heroScene), plus
 * environment reflections — procedural by default, or a drei preset if configured.
 *
 * Performance:
 *  - render loop stays off ("never") until StudioSetup has the reflections ready and every
 *    shader compiled in the background — no freeze while shaders compile
 *  - devicePixelRatio capped at 1.5 (1 on lite); lite also uses lower-poly geometry
 *  - frameloop switches to "demand" whenever the canvas is off-screen
 *  - fades in once ready, over the CSS gradient placeholder
 */
export default function BeautyCanvas({ quality, mode, categories, scroll, pointer }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const config = siteConfig.heroScene;
  const light = config.lightIntensity;
  const environment = config.environment;
  const panelTints = useMemo<[string, string]>(() => [config.keyLightColor, config.rimLightColor], [config]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry?.isIntersecting ?? false));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrap}
      aria-hidden
      className={cn("absolute inset-0 transition-opacity duration-[1.6s] ease-out-expo", ready ? "opacity-100" : "opacity-0")}
    >
      <SceneErrorBoundary>
        <Canvas
          dpr={[1, quality === "high" ? 1.5 : 1]}
          frameloop={!ready ? "never" : onScreen ? "always" : "demand"}
          camera={{ position: [0, 0, 7], fov: 35 }}
          gl={{ antialias: quality === "high", alpha: true, powerPreference: "high-performance" }}
        >
          <ambientLight intensity={0.35 * light} />
          {/* Warm key light from the upper right-front */}
          <directionalLight position={[3.5, 4, 5]} intensity={2.4 * light} color={config.keyLightColor} />
          {/* Soft rim light from behind-left, outlining the silhouette */}
          <directionalLight position={[-4, 2, -4]} intensity={1.8 * light} color={config.rimLightColor} />

          <BeautyScene
            mode={mode}
            quality={quality}
            config={config}
            categories={categories}
            scroll={scroll}
            pointer={pointer}
          />

          {environment === "procedural" ? (
            <StudioSetup bake tints={panelTints} onReady={onReady} />
          ) : (
            // A drei preset downloads its HDR first; compile only once it has arrived.
            <Suspense fallback={null}>
              <Environment preset={environment} />
              <StudioSetup bake={false} tints={panelTints} onReady={onReady} />
            </Suspense>
          )}
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
