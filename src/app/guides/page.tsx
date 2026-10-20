import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyState';
import { GuidesExplorer, type Guide } from '@/features/guides/GuidesExplorer';
import { homeFonts } from '@/features/home/landing/fonts';
import { listArticles, type ArticleSummary } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';
import '@/features/guides/guides.css';

const CATEGORIES = [
  { slug: 'buying-guides', label: 'Buying guides' },
  { slug: 'reviews', label: 'Reviews' },
  { slug: 'comparisons', label: 'Comparisons' },
  { slug: 'charging', label: 'Charging' },
  { slug: 'ownership', label: 'Ownership' },
  { slug: 'maintenance', label: 'Maintenance' },
  { slug: 'market', label: 'Rwanda EV market' },
  { slug: 'news', label: 'News' },
  { slug: 'owner-stories', label: 'Owner stories' },
  { slug: 'insights', label: 'Mobility insights' },
];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const { category } = await searchParams;
  const match = CATEGORIES.find((c) => c.slug === category);
  return buildMetadata({
    title: match ? `${match.label} — EV guides for Rwanda` : 'EV guides for Rwanda',
    description:
      'Buying guides, reviews, charging explainers, and market analysis for electric vehicle owners and buyers in Rwanda.',
    path: match ? `/guides?category=${match.slug}` : '/guides',
    // Only the index and real category views are indexable; nothing else.
    noindex: Boolean(category) && !match,
  });
}

const toGuide = (a: ArticleSummary): Guide => ({
  slug: a.slug,
  title: a.title,
  excerpt: a.excerpt,
  category: a.category,
  minutes: a.reading_minutes,
  image: a.cover_image ? { url: a.cover_image.url, alt: a.cover_image.alt } : null,
});

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  // The list for this view is asked for exactly as before. The full list is only used for the
  // counts on the topic buttons; if it fails, the counts are left out and the page still works.
  const [visible, all] = await Promise.all([
    listArticles(category ? { category } : {})
      .then((r) => r.items)
      .catch(() => null),
    category ? listArticles({}).then((r) => r.items).catch(() => null) : Promise.resolve(null),
  ]);

  const items = visible ?? [];
  const base = category ? all : visible;
  const counts = base
    ? Object.fromEntries(CATEGORIES.map((c) => [c.slug, base.filter((a) => a.category === c.slug).length]))
    : null;

  return (
    <div className={`gd-page ${homeFonts}`}>
      <div className="gd-w">
        <Breadcrumbs
          trail={[
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/guides' },
          ]}
        />
        <h1 className="gd-h1">
          <span className="gd-wd">
            <span className="gd-wi">
              EV guides for <em>Rwanda</em>
            </span>
          </span>
        </h1>

        <GuidesExplorer
          items={items.map(toGuide)}
          counts={counts}
          categories={CATEGORIES}
          active={category ?? null}
          empty={
            <EmptyState
              title="No guides published here yet"
              body="Editorial is being written. In the meantime, each category landing page carries a short explainer on the same topics."
              action={{ label: 'Electric cars in Rwanda', href: '/electric-cars-rwanda' }}
            />
          }
        />
      </div>
    </div>
  );
}
