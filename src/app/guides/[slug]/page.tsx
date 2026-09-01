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
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';

type Params = Promise<{ slug: string }>;

async function load(slug: string) {
  try {
    return await getArticle(slug);
  } catch (cause) {
    if (cause instanceof ApiError && cause.isNotFound) notFound();
    throw cause;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await load(slug);
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/guides/${article.slug}`,
    type: 'article',
    publishedTime: article.published_at,
    modifiedTime: article.updated_at,
    ...(article.cover_image
      ? {
          image: {
            url: article.cover_image.url,
            width: article.cover_image.width,
            height: article.cover_image.height,
            alt: article.cover_image.alt,
          },
        }
      : {}),
  });
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await load(slug);

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
    { name: article.title, path: `/guides/${article.slug}` },
  ];

  // Same threshold as ProsePage's table of contents: below three headings a rail
  // organises nothing and would just be clutter next to a short piece.
  const { headings, html: bodyHtml } = extractTableOfContents(article.body_html);
  const showToc = headings.length > 2;

  return (
    <div className="shell py-10">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <JsonLd
        data={articleJsonLd({
          title: article.title,
          description: article.excerpt,
          path: `/guides/${article.slug}`,
          image: article.cover_image?.url ?? '/brand/voltaris-logo-full.jpeg',
          publishedTime: article.published_at,
          modifiedTime: article.updated_at,
          author: article.author,
        })}
      />
      <JsonLd data={faqJsonLd(article.faqs)} />
      <TrackContentView slug={article.slug} category={article.category} />

      <Breadcrumbs trail={trail} />

      <div className={showToc ? 'mt-8 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10' : ''}>
        {showToc && (
          <>
            {/* Mobile / tablet: collapsed rather than a permanent rail — see
                ProsePage, which uses the identical pattern for Terms/Privacy. */}
            <details className="group mb-8 border border-hairline lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 marker:hidden">
                <span className="font-data text-eyebrow uppercase text-chrome">In this article</span>
                <ChevronDown
                  aria-hidden="true"
                  className="h-4 w-4 text-steel-muted transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <nav
                aria-label={`Sections in ${article.title}`}
                className="border-t border-hairline/60 px-4 py-3"
              >
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

            {/* Desktop / laptop: sticky rail, same lg:top-24 convention as
                ProsePage and the account sidebar. */}
            <nav
              aria-label={`Sections in ${article.title}`}
              className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
            >
              <p className="font-data text-eyebrow uppercase text-steel-muted">In this article</p>
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
            {article.category.replace(/-/g, ' ')} · {article.reading_minutes} min read
          </p>
          <h1 className="mt-3 font-display text-headline">{article.title}</h1>
          <p className="mt-4 font-data text-xs text-steel-muted">
            {article.author} ·{' '}
            <time dateTime={article.published_at}>
              {new Date(article.published_at).toLocaleDateString('en-RW', { dateStyle: 'long' })}
            </time>
          </p>

          {article.cover_image && (
            <div className="relative mt-8 aspect-[16/9] bg-slab">
              <Image
                src={article.cover_image.url}
                alt={article.cover_image.alt}
                fill
                sizes="(min-width: 768px) 42rem, 100vw"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/*
            The CMS sanitises on write — this app is not the last line of defence.
            If the CMS ever accepts untrusted authors, sanitise again here before
            this renders. Documented in ARCHITECTURE.md under "Security posture".

            bodyHtml (not article.body_html) — extractTableOfContents has added the
            ids the nav above links to and a scroll-mt-24 so jumping to one doesn't
            hide it under the sticky site header.
          */}
          <div className="prose-voltaris mt-10" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

          {article.faqs.length > 0 && (
            <section className="mt-14">
              <h2 className="font-display text-xl font-semibold tracking-tight">
                Common questions
              </h2>
              <div className="mt-4 divide-y divide-hairline/60 border-y border-hairline/60">
                {article.faqs.map((faq) => (
                  <details key={faq.question} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 marker:hidden">
                      <span className="font-display text-sm font-semibold tracking-tight">
                        {faq.question}
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-steel-muted transition-transform duration-200 group-open:rotate-180"
                      />
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-steel">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <footer className="mt-14 border-t border-hairline/60 pt-8">
            <Link href="/cars" className="font-data text-eyebrow uppercase text-volt hover:underline">
              Browse electric vehicles listed in Rwanda →
            </Link>
          </footer>
        </article>
      </div>
    </div>
  );
}
