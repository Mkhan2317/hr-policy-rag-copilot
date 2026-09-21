import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export — no Node.js runtime needed, served by FastAPI in production
  output: "export",
  images: { unoptimized: true },
  trailingSlash: false,
};

export default nextConfig;
