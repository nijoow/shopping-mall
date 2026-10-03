import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/content/site';
export default function robots(): MetadataRoute.Robots {
  return {
    sitemap: `${SITE_URL}/sitemap.xml`,
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
