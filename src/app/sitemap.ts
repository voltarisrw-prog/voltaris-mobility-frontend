import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { getVehicleSitemap } from '@/lib/api/vehicles';
import { getArticleSitemap, listPostSitemap } from '@/lib/api/content';
import { listDealers } from '@/lib/api/dealers';

const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
}[] = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/cars', priority: 0.9, changeFrequency: 'daily' },
  { path: '/compare', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/charging', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/guides', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'daily' },
  { path: '/dealers', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/sell', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/test-drive', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/how-it-works', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/legal/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/legal/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/trust-and-verification', priority: 0.5, changeFrequency: 'monthly' },
];

/**
 * Curated landing pages only. Filter permutations are deliberately absent — see the
 * indexation policy in lib/vehicles/filters.ts. Each of these has standalone intent
 * and its own editorial content, so each earns a place in the index.
 */
const CATEGORY_ROUTES = [
  '/electric-cars-rwanda',
  '/electric-suvs-rwanda',
  '/electric-sedans-rwanda',
  '/used-electric-cars-rwanda',
  '/electric-cars-kigali',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${site.url}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const categoryEntries: MetadataRoute.Sitemap = CATEGORY_ROUTES.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  let vehicleEntries: MetadataRoute.Sitemap = [];
  try {
    const page = await getVehicleSitemap(1);
    vehicleEntries = page.items
      // Sold listings stay reachable at their URL but leave the sitemap; they are no
      // longer content we are asking search engines to surface.
      .filter((vehicle) => vehicle.status !== 'sold' && vehicle.status !== 'unavailable')
      .map((vehicle) => ({
        url: `${site.url}/cars/${vehicle.slug}`,
        lastModified: new Date(vehicle.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
  } catch {
    // A sitemap missing listings is recoverable; a build failing on it is not.
  }

  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const page = await getArticleSitemap();
    articleEntries = page.items.map((article) => ({
      url: `${site.url}/guides/${article.slug}`,
      lastModified: new Date(article.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    // Same reasoning as vehicles: degrade, do not fail the build.
  }

  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const page = await listPostSitemap();
    postEntries = page.items.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      // Blog posts are dated and immutable once published; they do not get
      // revisited the way a guide does.
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    }));
  } catch {
    // Same reasoning as vehicles: degrade, do not fail the build.
  }

  let dealerEntries: MetadataRoute.Sitemap = [];
  try {
    const page = await listDealers();
    dealerEntries = page.items.map((dealer) => ({
      url: `${site.url}/dealers/${dealer.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    // Ditto.
  }

  return [
    ...staticEntries,
    ...categoryEntries,
    ...vehicleEntries,
    ...articleEntries,
    ...postEntries,
    ...dealerEntries,
  ];
}
