/** @type {import('next').NextConfig} */
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cfszzkoqokxwlflvmpgr.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    minimumCacheTTL: 3600,
    formats: ['image/webp', 'image/avif'],
  },
}
module.exports = nextConfig