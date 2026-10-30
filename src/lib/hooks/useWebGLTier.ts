"use client";

import { useSyncExternalStore } from "react";

/**
 * "hardware": a real GPU is available → render the 3D scene.
 * "software": WebGL works but is emulated on the CPU (SwiftShader, llvmpipe, "Basic Render
 *             Driver"…) — common on machines with GPU acceleration disabled and in headless
 *             test browsers. Every 3D frame would block the main thread, so use the static fallback.
 * "none":     no WebGL at all (or not yet known during SSR).
 */
export type WebGLTier = "hardware" | "software" | "none";

let cached: WebGLTier | null = null;

function detect(): WebGLTier {
  if (cached) return cached;
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return (cached = "none");
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext(); // free the probe context right away
    cached = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer) ? "software" : "hardware";
  } catch {
    cached = "none";
  }
  return cached;
}

const noopSubscribe = () => () => {};
const notChecked = (): WebGLTier => "none";

/**
 * Detected once per page load; "none" on the server so SSR never assumes a GPU.
 * Probing creates a WebGL context, which is surprisingly expensive on phones (~0.2s), so pass
 * `enabled = false` until 3D could actually be shown — the probe then never runs at all.
 */
export function useWebGLTier(enabled = true): WebGLTier {
  return useSyncExternalStore(noopSubscribe, enabled ? detect : notChecked, () => "none");
}
