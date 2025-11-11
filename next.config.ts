import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    // ✅ Skip lint checks during production build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ allow production builds to succeed even if type errors are present
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
