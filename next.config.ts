import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'resources.premierleague.com',
        port: '',
        pathname: '/premierleague25/photos/players/**',
      },
    ],
  },
};

export default nextConfig;
