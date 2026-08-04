import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // GitHub Pages serves from /hostel-mass-app/ subdirectory
  basePath: "/hostel-mass-app",
  assetPrefix: "/hostel-mass-app",
};

export default nextConfig;
