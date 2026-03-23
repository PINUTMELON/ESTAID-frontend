import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.fal.media',
      },
    ],
  },
  async rewrites() {
    return [
      {
        // NextAuth(/api/auth)와 경로 충돌을 방지하기 위해 /proxy/ 사용
        source: '/proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
