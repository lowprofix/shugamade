/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gktuvdoqpexlorlmgpox.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
        search: '',
      },
    ],
    // Configuration pour améliorer les performances et éviter les timeouts
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Augmenter le timeout pour les images externes
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
  },
}

module.exports = nextConfig 