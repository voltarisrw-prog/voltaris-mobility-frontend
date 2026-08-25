import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyState';
import { listArticles, type ArticleSummary } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

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

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  let articles: ArticleSummary[] = [];
  let failed = false;
  try {
    articles = (await listArticles(category ? { category } : {})).items;
  } catch {
    failed = true;
  }

  return (
    <div className="shell py-10">
      <Breadcrumbs
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
        ]}
      />
      <h1 className="mt-6 font-display text-headline">EV guides for Rwanda</h1>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-steel">
        What it actually takes to buy, charge, and run an electric vehicle here — written for this
        market, not translated from a European one.
      </p>

      <nav aria-label="Guide categories" className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/guides"
          aria-current={!category ? 'page' : undefined}
          className={
            !category
              ? 'bg-chrome px-3 py-2 font-data text-eyebrow uppercase text-surface'
              : 'border border-hairline px-3 py-2 font-data text-eyebrow uppercase hover:border-chrome'
          }
        >
          All
        </Link>
        {CATEGORIES.map((item) => (
          <Link
            key={item.slug}
            href={`/guides?category=${item.slug}`}
            aria-current={category === item.slug ? 'page' : undefined}
            className={
              category === item.slug
                ? 'bg-chrome px-3 py-2 font-data text-eyebrow uppercase text-surface'
                : 'border border-hairline px-3 py-2 font-data text-eyebrow uppercase hover:border-chrome'
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-10">
        {failed || articles.length === 0 ? (
          <EmptyState
            title="No guides published here yet"
            body="Editorial is being written. In the meantime, each category landing page carries a short explainer on the same topics."
            action={{ label: 'Electric cars in Rwanda', href: '/electric-cars-rwanda' }}
          />
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article key={article.slug} className="group relative">
                {article.cover_image && (
                  <div className="relative aspect-[16/10] overflow-hidden bg-slab">
                    <Image
                      src={article.cover_image.url}
                      alt={article.cover_image.alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <p className="eyebrow mt-4">
                  {article.category.replace(/-/g, ' ')} · {article.reading_minutes} min read
                </p>
                <h2 className="mt-2 font-display text-lg font-semibold leading-tight tracking-tight">
                  <Link href={`/guides/${article.slug}`} className="after:absolute after:inset-0">
                    {article.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-steel">{article.excerpt}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
