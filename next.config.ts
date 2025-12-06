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

  // Webpack config untuk SVG handling
  webpack(config, { isServer }) {
    // SVG handling with @svgr/webpack
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: false,
            titleProp: true,
            ref: true,
          },
        },
      ],
    });
    return config;
  },
};

export default nextConfig;
