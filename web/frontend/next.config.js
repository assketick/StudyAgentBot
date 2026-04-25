/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

const nextConfig = {
  env: {
    NEXT_PUBLIC_BOT_NAME: process.env.NEXT_PUBLIC_BOT_NAME || "",
  },
  allowedDevHosts: [
    "lesha-bibasic-felix.ngrok-free.dev",
  ],
  async rewrites() {
    if (process.env.NODE_ENV === "production") return [];
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
