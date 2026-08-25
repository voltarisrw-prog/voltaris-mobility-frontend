import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { TrackContentView } from '@/components/TrackContentView';
import { ApiError } from '@/lib/api/errors';
import { getArticle } from '@/lib/api/content';
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

      <article className="mx-auto mt-8 max-w-2xl">
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
        */}
        <div
          className="prose-voltaris mt-10"
          dangerouslySetInnerHTML={{ __html: article.body_html }}
        />

        {article.faqs.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-xl font-semibold tracking-tight">Common questions</h2>
            <div className="mt-4 divide-y divide-hairline/60 border-y border-hairline/60">
              {article.faqs.map((faq) => (
                <details key={faq.question} className="py-4">
                  <summary className="cursor-pointer list-none font-display text-sm font-semibold tracking-tight">
                    {faq.question}
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
  );
}
