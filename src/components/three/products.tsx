"use client";

import { useMemo, type ReactNode } from "react";
import { Vector2 } from "three";
import type { HeroSceneObject } from "@/config/types";
import type { BeautyMaterials } from "./materials";

/**
 * Procedural beauty products built only from three.js primitives (Cylinder, Lathe, Torus,
 * Circle). No model files. Each product is roughly 2.2 units tall and centred on the origin,
 * so the scene can swap and scale them interchangeably.
 *
 * `segments` controls smoothness: 64 on capable devices, 24 on low-end ones.
 */
interface ProductProps {
  m: BeautyMaterials;
  segments: number;
}

const lathe = (points: [number, number][]) => points.map(([x, y]) => new Vector2(x, y));

/** Gold casing + band + inner sleeve + rounded bullet. */
export function Lipstick({ m, segments }: ProductProps) {
  const bullet = useMemo(
    () =>
      lathe([
        [0, 0],
        [0.29, 0],
        [0.29, 0.42],
        [0.28, 0.52],
        [0.24, 0.63],
        [0.17, 0.72],
        [0.09, 0.78],
        [0, 0.8],
      ]),
    [],
  );
  return (
    <group>
      <mesh material={m.gold} position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 1, segments]} />
      </mesh>
      <mesh material={m.gold} position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.425, 0.028, 12, segments]} />
      </mesh>
      <mesh material={m.gold} position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.34, 0.36, 0.4, segments]} />
      </mesh>
      <mesh material={m.primary} position={[0, 0.3, 0]}>
        <latheGeometry args={[bullet, segments]} />
      </mesh>
    </group>
  );
}

/** Round compact: gold base with pressed powder, hinged lid opened to show the mirror. */
export function Compact({ m, segments }: ProductProps) {
  return (
    // Tilted toward the viewer so both the powder and the mirror read clearly.
    <group rotation={[0.55, 0, 0]} position={[0, -0.25, 0]} scale={0.85}>
      <mesh material={m.gold}>
        <cylinderGeometry args={[0.95, 0.95, 0.2, segments]} />
      </mesh>
      <mesh material={m.gold} position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.95, 0.035, 12, segments]} />
      </mesh>
      <mesh material={m.powder} position={[0, 0.105, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.03, segments]} />
      </mesh>
      {/* Lid hinged at the back edge, opened ~110° */}
      <group position={[0, 0.12, -0.95]} rotation={[-1.92, 0, 0]}>
        <group position={[0, 0, 0.95]}>
          <mesh material={m.gold}>
            <cylinderGeometry args={[0.95, 0.95, 0.12, segments]} />
          </mesh>
          <mesh material={m.gold} position={[0, -0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.95, 0.03, 12, segments]} />
          </mesh>
          <mesh material={m.mirror} position={[0, -0.065, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.82, segments]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/** Makeup brush: tapered lacquered handle, gold ferrule, domed bristles. */
export function Brush({ m, segments }: ProductProps) {
  const handle = useMemo(
    () =>
      lathe([
        [0, -1.35],
        [0.06, -1.33],
        [0.085, -1.1],
        [0.11, -0.4],
        [0.125, 0.12],
        [0, 0.12],
      ]),
    [],
  );
  const bristles = useMemo(
    () =>
      lathe([
        [0, 0],
        [0.14, 0],
        [0.22, 0.14],
        [0.27, 0.34],
        [0.25, 0.52],
        [0.17, 0.68],
        [0.07, 0.76],
        [0, 0.78],
      ]),
    [],
  );
  return (
    <group rotation={[0, 0, -0.45]} position={[0, -0.05, 0]}>
      <mesh material={m.primary}>
        <latheGeometry args={[handle, segments]} />
      </mesh>
      <mesh material={m.gold} position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.15, 0.125, 0.48, segments]} />
      </mesh>
      <mesh material={m.bristle} position={[0, 0.6, 0]}>
        <latheGeometry args={[bristles, segments]} />
      </mesh>
    </group>
  );
}

/** Serum dropper bottle: clear glass, tinted serum, gold collar, rounded bulb. */
export function Serum({ m, segments }: ProductProps) {
  const bottle = useMemo(
    () =>
      lathe([
        [0, -1],
        [0.5, -1],
        [0.56, -0.94],
        [0.56, 0.2],
        [0.5, 0.36],
        [0.32, 0.5],
        [0.2, 0.56],
        [0.19, 0.64],
      ]),
    [],
  );
  const serum = useMemo(
    () =>
      lathe([
        [0, -0.95],
        [0.5, -0.95],
        [0.51, -0.9],
        [0.51, -0.05],
        [0, -0.05],
      ]),
    [],
  );
  const bulb = useMemo(
    () =>
      lathe([
        [0, 0],
        [0.15, 0],
        [0.17, 0.14],
        [0.15, 0.32],
        [0.08, 0.45],
        [0, 0.48],
      ]),
    [],
  );
  return (
    <group position={[0, -0.1, 0]}>
      <mesh material={m.liquid} renderOrder={1}>
        <latheGeometry args={[serum, segments]} />
      </mesh>
      <mesh material={m.glass} renderOrder={2}>
        <latheGeometry args={[bottle, segments]} />
      </mesh>
      <mesh material={m.gold} position={[0, 0.76, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.26, segments]} />
      </mesh>
      <mesh material={m.deep} position={[0, 0.89, 0]}>
        <latheGeometry args={[bulb, segments]} />
      </mesh>
    </group>
  );
}

export const PRODUCTS: Record<HeroSceneObject, (props: ProductProps) => ReactNode> = {
  lipstick: Lipstick,
  compact: Compact,
  brush: Brush,
  serum: Serum,
};
