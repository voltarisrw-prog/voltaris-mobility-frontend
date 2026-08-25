import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyState';
import { JsonLd } from '@/components/JsonLd';
import { listPosts, type ArticleSummary } from '@/lib/api/content';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { site } from '@/config/site';

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

  const [lead, ...rest] = posts;
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
  ];

  return (
    <div className="shell py-10">
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
      <Breadcrumbs trail={trail} />

      <header className="mt-6 max-w-2xl">
        <p className="eyebrow">From the team</p>
        <h1 className="mt-4 font-display text-display">The Voltaris blog</h1>
        <p className="mt-4 text-base leading-relaxed text-steel">
          What is changing in Rwanda&rsquo;s EV market, and what we are building. For the
          evergreen material — buying, charging, ownership — see the{' '}
          <Link href="/guides" className="text-volt underline underline-offset-2">
            guides
          </Link>
          .
        </p>
      </header>

      <div className="mt-12">
        {failed || posts.length === 0 ? (
          <EmptyState
            title="Nothing published yet"
            body="The first posts are being written. In the meantime, the guides cover buying, charging, and running an EV here."
            action={{ label: 'Read the guides', href: '/guides' }}
          />
        ) : (
          <>
            {/* The most recent post gets the full width. On a blog, recency is the
                hierarchy — there is no editor picking a favourite. */}
            {lead && (
              <article className="group relative grid gap-8 border-b border-hairline/60 pb-12 lg:grid-cols-2 lg:items-center">
                {lead.cover_image && (
                  <div className="relative aspect-[16/10] overflow-hidden bg-abyss">
                    <Image
                      src={lead.cover_image.url}
                      alt={lead.cover_image.alt}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      priority
                    />
                  </div>
                )}
                <div>
                  <p className="eyebrow">
                    Latest · {lead.category.replace(/-/g, ' ')} · {lead.reading_minutes} min
                  </p>
                  <h2 className="mt-3 font-display text-headline">
                    <Link href={`/blog/${lead.slug}`} className="after:absolute after:inset-0">
                      {lead.title}
                    </Link>
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-steel">{lead.excerpt}</p>
                  <p className="mt-4 font-data text-xs text-steel-muted">
                    {lead.author} ·{' '}
                    <time dateTime={lead.published_at}>
                      {new Date(lead.published_at).toLocaleDateString('en-RW', { dateStyle: 'long' })}
                    </time>
                  </p>
                </div>
              </article>
            )}

            {rest.length > 0 && (
              <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <article key={post.slug} className="group relative">
                    {post.cover_image && (
                      <div className="relative aspect-[16/10] overflow-hidden bg-abyss">
                        <Image
                          src={post.cover_image.url}
                          alt={post.cover_image.alt}
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                        />
                      </div>
                    )}
                    <p className="eyebrow mt-4">
                      {post.category.replace(/-/g, ' ')} · {post.reading_minutes} min
                    </p>
                    <h3 className="mt-2 font-display text-lg font-semibold leading-tight tracking-tight">
                      <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-steel">{post.excerpt}</p>
                    <p className="mt-3 font-data text-xs text-steel-muted">
                      <time dateTime={post.published_at}>
                        {new Date(post.published_at).toLocaleDateString('en-RW', { dateStyle: 'medium' })}
                      </time>
                    </p>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <p className="mt-16 font-data text-xs text-steel-muted">
        <Link href="/blog/rss.xml" className="hover:text-volt">
          RSS feed
        </Link>
      </p>
    </div>
  );
}
