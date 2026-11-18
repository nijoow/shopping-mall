import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/studio/',
        '/designs',
        '/cart',
        '/checkout',
        '/orders/',
        '/my-page',
        '/share/',
      ],
    },
  };
}
