/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  images: {
    // 자체 제작 제품 아트(SVG) 서빙용 — 스크립트 실행이 차단된 샌드박스로 제한
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'bbbtan.cafe24.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'adererror.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
};

module.exports = withPWA(nextConfig);
