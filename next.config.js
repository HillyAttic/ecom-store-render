/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'images.unsplash.com',
      'randomuser.me',
      'i.pravatar.cc',
      'cloudflare-ipfs.com'
    ],
    unoptimized: true,
  },
  experimental: {
    // Disable optimizeCss to avoid critters issues
    optimizeCss: false,
  },
  distDir: 'custom-build',
  // The dir option is not valid in Next.js config
  // dir: './src',
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'standalone',
  webpack: (config, { isServer, dev }) => {
    // Fix for the "to" argument error in path.relative
    config.watchOptions = {
      ...config.watchOptions,
      followSymlinks: false,
      ignored: ['**/node_modules/**', '**/.git/**'],
    };

    // Add a custom resolver to handle undefined paths
    const originalResolve = config.resolve;
    config.resolve = {
      ...originalResolve,
      fallback: {
        ...originalResolve.fallback,
        path: require.resolve('path-browserify'),
      },
    };

    // Patch the path module to handle undefined paths
    if (dev && !isServer) {
      const originalRelative = path.relative;
      path.relative = function patchedRelative(from, to) {
        if (from === undefined || to === undefined) {
          console.warn('Warning: path.relative called with undefined arguments');
          return '';
        }
        return originalRelative(from, to);
      };
    }

    return config;
  },
};

module.exports = nextConfig; 