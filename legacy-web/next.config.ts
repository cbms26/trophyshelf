import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root: the repo root also holds the mobile app's
  // package-lock.json, and Next's auto-detection was picking that up
  // instead of this app's own directory.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
