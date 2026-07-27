import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force OG/meta into <head> for all UAs. Streaming metadata puts tags in
  // <body>, which WhatsApp and many social crawlers ignore.
  htmlLimitedBots: /.*/,

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/dosen",
        destination: "/tim-kami",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      // WhatsApp requires a real image extension on og:image URLs.
      {
        source: "/og/berita/:id.jpg",
        destination: "/api/og/berita/:id",
      },
    ];
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
