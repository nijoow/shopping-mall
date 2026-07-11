/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 소셜 로그인 아이콘(kakao/naver/google.svg)을 next/image로 서빙하기 위함 —
    // 스크립트 실행이 차단된 샌드박스 CSP로 제한
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

module.exports = nextConfig;
