import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'X-Robots-Tag',
              value: 'noindex, nofollow',
            },
          ],
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
