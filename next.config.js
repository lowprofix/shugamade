/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Disable x-powered-by header for security reasons
  poweredByHeader: false,
  // Configure image domains if needed
  images: {
    domains: [],
  },
  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add any other configuration options needed for your project
};

module.exports = nextConfig;
