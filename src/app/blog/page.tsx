import type { Metadata } from 'next';
import Link from 'next/link';
import { Rss } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyState';
import { JsonLd } from '@/components/JsonLd';
import { BlogExplorer, type BlogCard } from '@/features/blog/BlogExplorer';
import { homeFonts } from '@/features/home/landing/fonts';
import { listPosts, type ArticleSummary } from '@/lib/api/content';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { site } from '@/config/site';
import '@/features/blog/blog.css';

export const metadata: Metadata = buildMetadata({
  title: 'Voltaris blog — EV news and market updates from Rwanda',
  description:
    'Company news, Rwandan EV market updates, and mobility analysis from the Voltaris team. Dated posts, kept as published.',
  path: '/blog',
});

export const revalidate = 300;

export default async function BlogPage() {
  let posts: ArticleSummary[] = [];
  let failed = false;
  try {
    posts = (await listPosts()).items;
  } catch {
    failed = true;
  }

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
  ];

  // Dates are formatted here, on the server, so the page never disagrees with itself on hydration.
  const cards: BlogCard[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    minutes: p.reading_minutes,
    date: new Date(p.published_at).toLocaleDateString('en-RW', { dateStyle: 'medium' }),
    dateLong: new Date(p.published_at).toLocaleDateString('en-RW', { dateStyle: 'long' }),
    author: typeof p.author === 'string' ? p.author : undefined,
    image: p.cover_image ? { url: p.cover_image.url, alt: p.cover_image.alt } : null,
  }));

  return (
    <div className={`bl-page ${homeFonts}`}>
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          '@id': `${site.url}/blog#blog`,
          name: `${site.name} blog`,
          url: absoluteUrl('/blog'),
          publisher: { '@id': `${site.url}#organization` },
        }}
      />
      <div className="bl-w">
        <Breadcrumbs trail={trail} />

        <h1 className="bl-h1">
          <span className="bl-wd">
            <span className="bl-wi">
              The Voltaris <em>blog</em>
            </span>
          </span>
        </h1>
        {failed || cards.length === 0 ? (
          <div className="bl-empty">
            <EmptyState
              title="Nothing published yet"
              body="The first posts are being written. In the meantime, the guides cover buying, charging, and running an EV here."
              action={{ label: 'Read the guides', href: '/guides' }}
            />
          </div>
        ) : (
          <BlogExplorer posts={cards} />
        )}

        <Link href="/blog/rss.xml" className="bl-rss">
          <Rss size={18} aria-hidden="true" /> RSS feed
        </Link>
      </div>
    </div>
  );
}
