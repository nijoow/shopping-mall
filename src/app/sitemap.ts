import type { MetadataRoute } from 'next';
import { PRODUCTS } from '@/domain/catalog';
import { SITE_URL } from '@/content/site';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '',
    '/shop/all',
    '/shop/sneakers',
    '/shop/clothing',
    '/shop/accessories',
    '/about',
    ...PRODUCTS.map(p => `/product/${p.id}`),
  ].map(path => ({ url: `${SITE_URL}${path}` }));
}
