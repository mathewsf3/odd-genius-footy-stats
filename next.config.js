/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: [
      'cdn.footystats.org',
      'api.allsportsapi.com',
      'logo.clearbit.com',
      'logos-world.net',
      'www.thesportsdb.com'
    ],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_FOOTY_STATS_API_KEY: process.env.NEXT_PUBLIC_FOOTY_STATS_API_KEY,
    NEXT_PUBLIC_FOOTY_STATS_BASE_URL: process.env.NEXT_PUBLIC_FOOTY_STATS_BASE_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone'
}

module.exports = nextConfig
