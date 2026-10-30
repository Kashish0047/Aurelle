import path from "node:path";
import type { NextConfig } from "next";

/** Photos uploaded in /admin live in Supabase Storage; allow next/image to optimise them. */
function supabaseImages(): NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    return [
      {
        protocol: url.protocol === "http:" ? "http" : "https",
        hostname: url.hostname,
        port: url.port,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return []; // Supabase not configured: only local /images are used.
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the project root so a stray lockfile in a parent folder doesn't confuse Turbopack.
  turbopack: { root: path.resolve(".") },
  images: {
    formats: ["image/avif", "image/webp"],
    // Add more remote hosts here if a client's photos live on a CDN,
    // e.g. { protocol: "https", hostname: "images.unsplash.com" }.
    remotePatterns: [...supabaseImages()],
  },
};

export default nextConfig;
