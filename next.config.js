/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint configuration
  eslint: {
    // Don't run ESLint during builds (we'll catch errors in development)
    ignoreDuringBuilds: false,
    // Only run ESLint on specific directories
    dirs: ['app', 'components', 'lib'],
  },
  
  // TypeScript configuration
  typescript: {
    // Don't run TypeScript during builds (we'll catch errors in development)
    ignoreBuildErrors: false,
  },
  
  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'my-value',
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
