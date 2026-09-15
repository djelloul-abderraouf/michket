function resolveBackendApiBase() {
  const raw = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001")
    .replace(/\/$/, "")
    .replace("://localhost", "://127.0.0.1");

  return raw.endsWith("/api/v1") ? raw : `${raw}/api/v1`;
}

/** @type {import("next").NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${resolveBackendApiBase()}/:path*`,
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;