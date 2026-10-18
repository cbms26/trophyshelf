import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root: the repo root also holds the mobile app's
  // package-lock.json, and Next's auto-detection was picking that up
  // instead of this app's own directory.
  turbopack: {
    root: path.join(__dirname),
  },
  // The site root is the TrophyShelf PWA (the Expo app's web build, copied
  // into public/ by scripts/copy-pwa.mjs). Fallback rewrites only run after
  // pages, API routes and public files miss, so /api/*, /privacy and /terms
  // are still served by Next.js and every other path boots the app.
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [{ source: "/:path*", destination: "/index.html" }],
    };
  },
  async headers() {
    return [
      {
        // The app shell and service worker must be revalidated on every load
        // so a new deploy reaches installed PWAs promptly.
        source: "/:file(index.html|sw.js|manifest.json)",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ];
  },
};

export default nextConfig;
