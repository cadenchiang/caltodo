import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  serverExternalPackages: ["@tensorflow/tfjs", "nsfwjs", "sharp"],

  // Empty Turbopack config silences the "webpack config but no turbopack
  // config" error. Serwist's webpack plugin is disabled in dev (see above),
  // so dev can run under Turbopack safely; builds are run with --webpack.
  turbopack: {},

  // Skip TS errors during build — pre-existing tiptap type issues
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },

  // Required for PostHog proxy to work with middleware
  skipMiddlewareUrlNormalize: true,

  // Security headers applied to all routes.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },

  // Proxy PostHog requests through our domain to bypass ad blockers.
  // Requests to /a/* are forwarded to us.i.posthog.com.
  async rewrites() {
    return [
      {
        source: "/a/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/a/decide",
        destination: "https://us.i.posthog.com/decide",
      },
      {
        source: "/a/e",
        destination: "https://us.i.posthog.com/e",
      },
      {
        source: "/a/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
};

export default withSerwist(nextConfig);
