import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    // Modern formats first; Next negotiates per request.
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    // Three.js and drei are large barrel exports — this keeps unused modules
    // out of the client bundle.
    optimizePackageImports: ["@react-three/drei", "three"],
  },

  // GLB/GLTF and KTX2 assets are immutable once hashed into /public/models.
  async headers() {
    return [
      {
        source: "/models/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/textures/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
