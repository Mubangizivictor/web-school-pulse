import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',   // static export for Firebase Hosting
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
