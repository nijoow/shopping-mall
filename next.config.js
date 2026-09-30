/** @type {import('next').NextConfig} */
module.exports = {
  poweredByHeader: false,
  images: {
    localPatterns: [{ pathname: '/editorial/**' }, { pathname: '/images/**' }],
  },
  async redirects() {
    return [
      { source: '/3d-shop', destination: '/studio/runner', permanent: true },
      { source: '/shop', destination: '/shop/all', permanent: true },
      { source: '/auth/sign-up', destination: '/auth/login', permanent: true },
      { source: '/admin/:path*', destination: '/my-page', permanent: false },
    ];
  },
};
