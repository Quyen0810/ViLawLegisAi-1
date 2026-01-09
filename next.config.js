/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Commented out to enable middleware
  reactStrictMode: false, // Tắt strict mode để giảm hydration warnings
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ["localhost"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Performance optimizations
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
    '@ant-design/icons': {
      transform: '@ant-design/icons/{{member}}',
    },
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'recharts'],
  },
  // SWC minify for faster builds
  swcMinify: true,
};

module.exports = nextConfig;
