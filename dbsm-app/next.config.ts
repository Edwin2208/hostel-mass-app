import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // GitHub Pages deploys to /hostel-mass-app/ subpath
  // Comment out basePath if using a custom domain or Vercel
  // basePath: "/hostel-mass-app",
  // assetPrefix: "/hostel-mass-app",
};

export default nextConfig;
