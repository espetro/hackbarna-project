/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['images.unsplash.com', 'source.unsplash.com'],
  },
}

module.exports = nextConfig
