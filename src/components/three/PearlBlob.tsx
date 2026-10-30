"use client";

import { forwardRef } from "react";
import { MeshDistortMaterial } from "@react-three/drei";
import type { Mesh } from "three";
import type { SceneQuality } from "./types";

interface Props {
  color: string;
  iridescence: number;
  quality: SceneQuality;
}

/**
 * Liquid "pearl": a finely subdivided icosahedron whose surface is displaced by animated
 * simplex noise (drei's MeshDistortMaterial, a MeshPhysicalMaterial with a noise vertex shader),
 * so it slowly morphs like a drop of iridescent serum. Fewer subdivisions on low-end devices.
 */
export const PearlBlob = forwardRef<Mesh, Props>(function PearlBlob({ color, iridescence, quality }, ref) {
  const high = quality === "high";
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.25, high ? 40 : 12]} />
      <MeshDistortMaterial
        color={color}
        distort={0.32}
        speed={1.1}
        roughness={0.14}
        metalness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.1}
        iridescence={high ? iridescence : 0}
        iridescenceIOR={1.3}
      />
    </mesh>
  );
});
