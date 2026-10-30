import { useEffect, useMemo } from "react";
import { Color, DoubleSide, MeshPhysicalMaterial } from "three";
import type { HeroSceneConfig } from "@/config/types";
import type { SceneQuality } from "./types";

export interface BeautyMaterials {
  /** Gold / metal parts — casings, rims, ferrule, collar */
  gold: MeshPhysicalMaterial;
  /** Glossy tinted parts — lipstick bullet, brush handle */
  primary: MeshPhysicalMaterial;
  /** Matte tinted pressed powder in the compact */
  powder: MeshPhysicalMaterial;
  /** Tinted serum inside the bottle */
  liquid: MeshPhysicalMaterial;
  /** Darker tint for the dropper bulb */
  deep: MeshPhysicalMaterial;
  mirror: MeshPhysicalMaterial;
  glass: MeshPhysicalMaterial;
  bristle: MeshPhysicalMaterial;
  /** Materials whose colour follows the current tint (services scene). */
  tinted: MeshPhysicalMaterial[];
}

/**
 * One shared set of materials for every product, created once per canvas.
 * Shared instances keep shader programs to a minimum (they compile once, in the background —
 * see StudioSetup) and let the services scene re-tint every product by changing one colour.
 *
 * All colours come from `siteConfig.heroScene`; neutral tones (mirror, bulb) are derived from them.
 * No `transmission` anywhere: it renders the scene a second time and its shaders compile
 * synchronously on the first frame (multi-second freezes on Windows).
 */
export function useBeautyMaterials(config: HeroSceneConfig, quality: SceneQuality): BeautyMaterials {
  const mats = useMemo(() => {
    const iri = quality === "high" ? config.iridescence : 0;
    const primaryColor = new Color(config.primaryColor);
    const accent = new Color(config.accentColor);

    const gold = new MeshPhysicalMaterial({
      color: accent,
      metalness: 1,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      iridescence: iri * 0.5,
      iridescenceIOR: 1.4,
    });
    const primary = new MeshPhysicalMaterial({
      color: primaryColor,
      roughness: 0.32,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
      iridescence: iri * 0.25,
      iridescenceIOR: 1.3,
    });
    const powder = new MeshPhysicalMaterial({ color: primaryColor.clone(), roughness: 0.9 });
    const liquid = new MeshPhysicalMaterial({
      color: primaryColor.clone(),
      roughness: 0.1,
      clearcoat: 1,
      transparent: true,
      opacity: 0.85,
    });
    const deep = new MeshPhysicalMaterial({
      color: primaryColor.clone().multiplyScalar(0.45),
      roughness: 0.4,
      clearcoat: 0.6,
    });
    // Satin mirror: a perfect mirror would only reflect the (mostly empty) studio and read as black.
    const mirror = new MeshPhysicalMaterial({
      color: accent.clone().lerp(new Color("#ffffff"), 0.92),
      metalness: 0.45,
      roughness: 0.1,
      envMapIntensity: 1.6,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });
    const glass = new MeshPhysicalMaterial({
      color: new Color("#ffffff"),
      roughness: 0.05,
      clearcoat: 1,
      iridescence: iri * 0.6,
      iridescenceIOR: 1.3,
      transparent: true,
      opacity: 0.28,
      side: DoubleSide,
      depthWrite: false,
    });
    const bristle = new MeshPhysicalMaterial({ color: new Color(config.blobColor), roughness: 0.85 });

    return { gold, primary, powder, liquid, deep, mirror, glass, bristle, tinted: [primary, powder, liquid] };
  }, [config, quality]);

  useEffect(
    () => () =>
      [mats.gold, mats.primary, mats.powder, mats.liquid, mats.deep, mats.mirror, mats.glass, mats.bristle].forEach((m) =>
        m.dispose(),
      ),
    [mats],
  );

  return mats;
}
