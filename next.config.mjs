/** @type {import("next").NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
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
        hostname: "qzrelidpjrzbudnaqxcr.supabase.co",
      },
    ],
  },
};

export default nextConfig;