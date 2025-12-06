import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable empty Turbopack config (wajib agar tidak error)
  turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },

  // Webpack config masih didukung, tetapi hanya jika turbopack aktif
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
