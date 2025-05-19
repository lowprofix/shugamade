/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['gktuvdoqpexlorlmgpox.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gktuvdoqpexlorlmgpox.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig 