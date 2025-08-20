import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  serverComponentsExternalPackages: ['@opentelemetry/context-async-hooks'],
  webpack: (config, { isServer }) => {
    // Exclude async_hooks from client-side bundle
    if (!isServer) {
        config.externals = [...config.externals, 'async_hooks'];
    }
    return config;
  }
};

export default nextConfig;
