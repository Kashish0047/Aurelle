"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  RingGeometry,
  Scene,
  type BufferGeometry,
} from "three";

interface Props {
  /** Bake the procedural studio reflections. False when a drei <Environment preset> provides them. */
  bake: boolean;
  /** Tints of the two side light panels (key + rim light colours) */
  tints: [string, string];
  /** Called once reflections are baked and every material's shader has compiled. */
  onReady: () => void;
}

/**
 * Prepares the scene before its first frame, without freezing the page:
 *
 * 1. (bake) Bakes soft "studio" reflections from three glowing panels (a ring above, two tinted
 *    softboxes at the sides) into an environment map. Procedural — no HDR file to download.
 * 2. Compiles every material with `compileAsync`, which uses the browser's parallel shader
 *    compilation. Glass shaders can take seconds to compile on Windows (WebGL → Direct3D);
 *    done synchronously on the first frame, that would block scrolling and taps.
 *
 * The parent keeps the render loop off until `onReady`, showing the CSS bloom meanwhile.
 */
export function StudioSetup({ bake, tints, onReady }: Props) {
  // Read the live three.js objects inside the effect (R3F's getter) — the scene is imperative
  // state that this effect configures, not a React value.
  const get = useThree((state) => state.get);

  useEffect(() => {
    const { gl, scene, camera } = get();
    let alive = true;
    let envTarget: ReturnType<PMREMGenerator["fromScene"]> | null = null;

    if (bake) {
      const studio = new Scene();
      const geometries: BufferGeometry[] = [];
      const materials: MeshBasicMaterial[] = [];
      const panel = (geometry: BufferGeometry, color: string, intensity: number, position: [number, number, number]) => {
        const material = new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity), side: DoubleSide });
        const mesh = new Mesh(geometry, material);
        mesh.position.set(...position);
        mesh.lookAt(0, 0, 0);
        studio.add(mesh);
        geometries.push(geometry);
        materials.push(material);
      };
      panel(new RingGeometry(2.4, 3.2, 48), "#ffffff", 2.2, [0, 3, -4]);
      panel(new PlaneGeometry(3, 6), tints[0], 1.6, [5, 1, 2]);
      panel(new PlaneGeometry(3, 6), tints[1], 1.4, [-5, 0, -2]);

      const pmrem = new PMREMGenerator(gl);
      envTarget = pmrem.fromScene(studio, 0.04);
      scene.environment = envTarget.texture;
      pmrem.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    }

    gl.compileAsync(scene, camera)
      .catch(() => undefined) // if parallel compile isn't supported, the first frame compiles instead
      .finally(() => alive && onReady());

    return () => {
      alive = false;
      if (envTarget) {
        scene.environment = null;
        envTarget.dispose();
      }
    };
  }, [get, bake, tints, onReady]);

  return null;
}
