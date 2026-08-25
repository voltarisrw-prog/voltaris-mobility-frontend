import type { MetadataRoute } from 'next';
import { site } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

  // Staging and preview environments must never be crawlable.
  if (!isProduction) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/account',
          '/api/',
          '/checkout',
          '/order/',
          // Sort never changes the result set, only its order — pure duplication.
          '/cars?*sort=',
          '/*?*page=',
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
