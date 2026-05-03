const { withSentryConfig } = require("@sentry/nextjs");
const { URL } = require("node:url");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let supabaseHostname = "";
try {
  supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : "";
} catch {
  supabaseHostname = "";
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      ...(supabaseHostname ? [{ protocol: "https", hostname: supabaseHostname }] : []),
    ],
  },
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [{ key: 'Content-Type', value: 'application/manifest+json' }],
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
