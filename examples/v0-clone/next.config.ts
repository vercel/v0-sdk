import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      'v0/browser': 'v0-canary/browser',
    },
  },
  webpack(config) {
    config.resolve.alias['v0/browser'] = 'v0-canary/browser'
    return config
  },
}

export default nextConfig
