/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  turbopack: {},

  poweredByHeader: false,

  compress: true,

  experimental: {
    optimizePackageImports: [],
  },
};

module.exports = nextConfig;