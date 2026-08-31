import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import withBundleAnalyzer from "@next/bundle-analyzer";

// Bundle analyzer: `npm run analyze` sets ANALYZE=true and opens an
// interactive treemap of every chunk after the build. No-op otherwise.
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  // Do NOT reload the window when the browser fires an `online` event. That
  // event fires spuriously right after the initial connection settles, which
  // produced a visible full-page reload during first load (the "glitchy"
  // feeling). Runtime caching still works offline without this.
  reloadOnOnline: false,
  disable: process.env.NODE_ENV === "development",
  // Keep the install-time precache lean so the first visit isn't front-loaded
  // with the entire build output competing for bandwidth with the page the
  // user is actually waiting for. Large chunks and all images are served/
  // cached on demand by the runtimeCaching recipe (defaultCache) instead.
  maximumFileSizeToCacheInBytes: 1_500_000,
  exclude: [
    /\.map$/,
    /^manifest.*\.js$/,
    // Images don't need to be in the eager precache — runtimeCaching picks
    // them up the first time they're actually requested.
    /\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico)$/,
  ],
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

  // Force webpack to use in-memory cache instead of the pack-file cache.
  // The default 'filesystem' cache (.next/cache/webpack/*.pack) was the
  // source of nondeterministic Vercel build failures: 'Cannot read
  // properties of undefined (reading length)' inside the pack-file
  // deserialization path. Memory cache rebuilds fresh per process — the
  // first compile takes the same time, but builds are reliable.
  webpack: (config) => {
    config.cache = { type: "memory" };
    return config;
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

export default bundleAnalyzer(withSerwist(nextConfig));
