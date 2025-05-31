import type { NextConfig } from "next";
import { appConfig } from "./src/lib/config";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [...appConfig.images.remotePatterns],
    minimumCacheTTL: appConfig.images.optimization.minimumCacheTTL,
    formats: [...appConfig.images.optimization.formats],
    deviceSizes: [...appConfig.images.optimization.deviceSizes],
    imageSizes: [...appConfig.images.optimization.imageSizes],
    dangerouslyAllowSVG: appConfig.images.optimization.dangerouslyAllowSVG,
    contentDispositionType: appConfig.images.optimization.contentDispositionType,
  },
  
  // Configuration pour améliorer les performances
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons"],
  },
  
  // Configuration pour les redirections et rewrites si nécessaire
  async headers() {
    return [
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
