import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { TrackContentView } from '@/components/TrackContentView';
import { ApiError } from '@/lib/api/errors';
import { getArticle } from '@/lib/api/content';
import { extractTableOfContents } from '@/lib/content/toc';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { site } from '@/config/site';

type Params = Promise<{ slug: string }>;

async function load(slug: string) {
  try {
    const article = await getArticle(slug);
    // A guide reached through /blog is a duplicate URL for the same content.
    // Send it to its canonical home rather than serving both.
    if (article.kind !== 'blog') notFound();
    return article;
  } catch (cause) {
    if (cause instanceof ApiError && cause.isNotFound) notFound();
    throw cause;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await load(slug);
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.published_at,
    modifiedTime: post.updated_at,
    ...(post.cover_image
      ? {
          image: {
            url: post.cover_image.url,
            width: post.cover_image.width,
            height: post.cover_image.height,
            alt: post.cover_image.alt,
          },
        }
      : {}),
  });
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await load(slug);

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  // Same threshold and pattern as guides/[slug]/page.tsx and ProsePage.
  const { headings, html: bodyHtml } = extractTableOfContents(post.body_html);
  const showToc = headings.length > 2;

  return (
    <div className="shell py-10">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          // BlogPosting rather than Article: it is dated, part of a series, and
          // belongs to a Blog node, all of which this type expresses.
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          image: absoluteUrl(post.cover_image?.url ?? '/brand/voltaris-logo-full.jpeg'),
          datePublished: post.published_at,
          dateModified: post.updated_at,
          author: { '@type': 'Person', name: post.author },
          publisher: { '@id': `${site.url}#organization` },
          isPartOf: { '@id': `${site.url}/blog#blog` },
          mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
        }}
      />
      <JsonLd data={faqJsonLd(post.faqs)} />
      <TrackContentView slug={post.slug} category={post.category} />

      <Breadcrumbs trail={trail} />

      <div className={showToc ? 'mt-8 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10' : ''}>
        {showToc && (
          <>
            <details className="group mb-8 border border-hairline lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 marker:hidden">
                <span className="font-data text-eyebrow uppercase text-chrome">In this post</span>
                <ChevronDown
                  aria-hidden="true"
                  className="h-4 w-4 text-steel-muted transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <nav aria-label={`Sections in ${post.title}`} className="border-t border-hairline/60 px-4 py-3">
                <ul className="space-y-2">
                  {headings.map((heading) => (
                    <li key={heading.id} className={heading.level === 3 ? 'pl-4' : undefined}>
                      <a href={`#${heading.id}`} className="text-sm text-steel hover:text-volt">
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>

            <nav
              aria-label={`Sections in ${post.title}`}
              className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
            >
              <p className="font-data text-eyebrow uppercase text-steel-muted">In this post</p>
              <ul className="mt-3 space-y-2.5 border-l border-hairline pl-4">
                {headings.map((heading) => (
                  <li key={heading.id} className={heading.level === 3 ? 'pl-3' : undefined}>
                    <a
                      href={`#${heading.id}`}
                      className="block text-sm text-steel transition-colors hover:text-chrome"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        )}

        <article className={showToc ? 'mx-auto max-w-2xl lg:mx-0' : 'mx-auto max-w-2xl'}>
          <p className="eyebrow">
            {post.category.replace(/-/g, ' ')} · {post.reading_minutes} min read
          </p>
          <h1 className="mt-3 font-display text-headline">{post.title}</h1>
          <p className="mt-4 font-data text-xs text-steel-muted">
            {post.author} ·{' '}
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString('en-RW', { dateStyle: 'long' })}
            </time>
            {post.updated_at !== post.published_at && (
              <>
                {' · updated '}
                <time dateTime={post.updated_at}>
                  {new Date(post.updated_at).toLocaleDateString('en-RW', { dateStyle: 'medium' })}
                </time>
              </>
            )}
          </p>

          {post.cover_image && (
            <div className="relative mt-8 aspect-[16/9] bg-abyss">
              <Image
                src={post.cover_image.url}
                alt={post.cover_image.alt}
                fill
                sizes="(min-width: 768px) 42rem, 100vw"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Sanitised by the CMS on write. If untrusted authors are ever added,
              sanitise again here — noted in ARCHITECTURE.md.
              bodyHtml, not post.body_html — see extractTableOfContents. */}
          <div className="prose-voltaris mt-10" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

          <footer className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-hairline/60 pt-8">
            <Link href="/blog" className="font-data text-eyebrow uppercase text-volt hover:underline">
              ← All posts
            </Link>
            <Link href="/cars" className="font-data text-eyebrow uppercase text-volt hover:underline">
              Browse electric vehicles →
            </Link>
          </footer>
        </article>
      </div>
    </div>
  );
}
