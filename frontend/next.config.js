/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile packages that need it
  transpilePackages: ['@mediapipe/tasks-vision'],

  // Image optimization config
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    unoptimized: false,
  },

  // Disable ESLint during builds (we use tsc for type checking)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable type checking during build (we run tsc separately)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Webpack config to handle mediapipe wasm files
  webpack: (config, { isServer }) => {
    // Exclude @mediapipe server-side (it's browser-only)
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        '@mediapipe/tasks-vision',
      ];
    }

    // Handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    return config;
  },

  // Experimental features
  experimental: {
    // Optimize package imports for better tree-shaking
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Proxy SanzzOS backend API calls
  async rewrites() {
    return [
      {
        source: '/api/sanzzos/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
