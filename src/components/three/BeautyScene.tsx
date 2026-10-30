"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, MathUtils, type Group, type Mesh } from "three";
import type { HeroSceneConfig } from "@/config/types";
import { useBeautyMaterials } from "./materials";
import { PearlBlob } from "./PearlBlob";
import { PRODUCTS } from "./products";
import type { SceneInputs, SceneMode, SceneQuality } from "./types";

interface Props extends SceneInputs {
  mode: SceneMode;
  quality: SceneQuality;
  config: HeroSceneConfig;
  /** Services mode: category id of each card along the track, in order (drives the tint). */
  categories?: string[];
}

/**
 * The beauty scene: one procedural product in front of a morphing liquid pearl.
 * Inputs (scroll, pointer) are eased every frame with damp, so nothing ever snaps.
 *
 * "hero"     — shows heroScene.objects[0]. The product turns toward the pointer (±mouseRange°)
 *              with a gentle idle sway; the pearl drifts toward the cursor. Scrolling out of the
 *              hero (0→1) spins the product, tilts it back, scales it down and lifts it away.
 * "services" — scroll progress through the pinned services track (0→1) glides the product
 *              right → left and morphs through every object in heroScene.objects: the current one
 *              shrinks and spins away while the next grows in. Its tint eases to the
 *              categoryTints colour of the cards in view.
 */
export function BeautyScene({ mode, quality, config, categories = [], scroll, pointer }: Props) {
  const m = useBeautyMaterials(config, quality);
  const { viewport } = useThree();
  const root = useRef<Group>(null);
  const blob = useRef<Mesh>(null);
  const slots = useRef<(Group | null)[]>([]);
  const eased = useRef({ scroll: 0, px: 0, py: 0 });
  const tint = useMemo(() => new Color(config.primaryColor), [config.primaryColor]);
  const target = useMemo(() => new Color(), []);

  const segments = quality === "high" ? 64 : 24;
  const list = mode === "hero" ? [config.objects[0]] : config.objects;

  // Hero layout: beside the headline on wide screens, centred above it on portrait screens.
  const portrait = viewport.aspect < 1;
  const heroX = portrait ? 0 : viewport.width * 0.2;
  const heroY = portrait ? viewport.height * 0.28 : 0;
  const heroScale = portrait ? Math.min(0.75, viewport.width / 4.6) : 1.15;
  const drift = viewport.width * 0.08 * config.blobFollow;
  /** The pearl sits well behind the product so wide objects (the open compact) never cut into it. */
  const BLOB_Z = -2.6;

  useFrame((state, delta) => {
    const g = root.current;
    const b = blob.current;
    if (!g || !b) return;
    const e = eased.current;
    const t = state.clock.elapsedTime;
    e.scroll = MathUtils.damp(e.scroll, scroll.current ?? 0, 6, delta);
    e.px = MathUtils.damp(e.px, pointer.current?.x ?? 0, 3, delta);
    e.py = MathUtils.damp(e.py, pointer.current?.y ?? 0, 3, delta);
    const s = e.scroll;
    const range = MathUtils.degToRad(config.mouseRange);

    if (mode === "hero") {
      // Pointer-follow (eased, capped at ±range) + idle sway; scroll adds a spin and tilt-back.
      g.rotation.set(
        -e.py * range * 0.6 + s * 0.5,
        e.px * range + Math.sin(t * 0.5) * 0.12 + s * Math.PI * 0.75,
        -0.18 + Math.sin(t * 0.35) * 0.04,
      );
      g.scale.setScalar(heroScale * (1 - s * 0.35));
      g.position.set(heroX + s * (portrait ? 0 : 0.5), heroY + s * 1.1 + Math.sin(t * 0.8) * 0.05, 0);

      // The pearl sits behind and slightly up-right, drifting toward the cursor.
      b.position.set(heroX + 0.45 * heroScale + e.px * drift, heroY + 0.2 + e.py * drift * 0.7 + s * 0.6, BLOB_Z);
      b.scale.setScalar(heroScale * 1.15 * (1 - s * 0.25)); // a little larger to offset the extra distance
      return;
    }

    // ── services ──
    const arc = Math.sin(s * Math.PI); // 0 → 1 → 0 across the section
    g.position.set(
      MathUtils.lerp(viewport.width * 0.3, -viewport.width * 0.3, s),
      -0.25 + Math.sin(s * Math.PI * 2) * 0.25,
      0,
    );
    g.rotation.set(-0.15 + e.py * range * 0.4, e.px * range * 0.6 + t * 0.25, -0.12);
    g.scale.setScalar(0.62 + arc * 0.18);

    // Morph: between object i and i+1 the current one shrinks and spins away as the next grows in.
    const n = list.length;
    const seg = n > 1 ? s * (n - 1) : 0;
    const i0 = Math.min(Math.floor(seg), Math.max(0, n - 2));
    const mix = n > 1 ? MathUtils.smoothstep(seg - i0, 0.35, 0.65) : 0;
    slots.current.forEach((slot, k) => {
      if (!slot) return;
      const w = n === 1 ? 1 : k === i0 ? 1 - mix : k === i0 + 1 ? mix : 0;
      slot.scale.setScalar(Math.max(w, 0.0001));
      slot.rotation.y = (1 - w) * Math.PI * (k > i0 ? -0.9 : 0.9);
      slot.visible = w > 0.001;
    });

    // Tint follows the category of the cards currently in view.
    if (categories.length) {
      const cat = categories[Math.round(s * (categories.length - 1))] ?? "";
      target.set(config.categoryTints[cat] ?? config.primaryColor);
      tint.lerp(target, 1 - Math.exp(-4 * delta));
      m.tinted.forEach((mat) => mat.color.copy(tint));
      m.deep.color.copy(tint).multiplyScalar(0.45);
    }

    b.position.set(g.position.x + 0.4 + e.px * drift, g.position.y + 0.25 + e.py * drift * 0.7, BLOB_Z);
    b.scale.setScalar(0.75 + arc * 0.15);
  });

  return (
    <>
      <PearlBlob ref={blob} color={config.blobColor} iridescence={config.iridescence} quality={quality} />
      <group ref={root}>
        {list.map((type, k) => {
          const Product = PRODUCTS[type];
          return (
            <group key={`${type}-${k}`} ref={(el) => void (slots.current[k] = el)}>
              <Product m={m} segments={segments} />
            </group>
          );
        })}
      </group>
    </>
  );
}
