/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: { resolve: { extensionAlias: { '.js': string[] } } }) => {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    }
    return config
  },
  turbopack: {},
  serverExternalPackages: ['@prisma/client', 'prisma'],
}

module.exports = nextConfig