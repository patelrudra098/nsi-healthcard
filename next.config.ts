import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow accessing the dev server from other devices on the LAN (e.g. phone).
  allowedDevOrigins: ["192.168.1.25"],
};

export default nextConfig;

// Enable Cloudflare bindings in `next dev`.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
