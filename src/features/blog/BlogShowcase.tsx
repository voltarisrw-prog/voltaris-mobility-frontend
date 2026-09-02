'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { CoverflowShowcase } from '@/components/CoverflowShowcase';
import type { ArticleSummary } from '@/lib/api/content';

const CENTER_SIZE = 'h-[24rem] w-[19rem] sm:h-[28rem] sm:w-[23rem] lg:h-[32rem] lg:w-[26rem]';
const PEEK_SIZE = 'h-[20rem] w-[16rem] sm:h-[23rem] sm:w-[19rem] lg:h-[26rem] lg:w-[21rem]';

/**
 * Same coverflow as the homepage's showroom, carrying posts instead of
 * vehicles. Ordered by recency (whatever `listPosts()` already returns) —
 * this reshuffles how the same list is presented, it does not hand-pick a
 * "featured" post, which the blog page's own lead-post comment is explicit
 * about avoiding.
 *
 * The vehicle version's left/right pair are both actions (book a test drive,
 * open the listing) because a vehicle has two different things to do. A post
 * only has one real action — read it — so this keeps the same four-zone
 * layout but uses the left slot for reading time (informational) instead of
 * inventing a second action that doesn't exist for a blog post.
 */
export function BlogShowcase({ posts }: { posts: ArticleSummary[] }) {
  const withCovers = posts.filter((post) => post.cover_image);

  return (
    <CoverflowShowcase
      items={withCovers}
      getKey={(post) => post.slug}
      ariaLabel="Recent posts"
      peekLabel={(post) => `Read ${post.title}`}
      centerSizeClassName={CENTER_SIZE}
      peekSizeClassName={PEEK_SIZE}
      renderPeek={(post) =>
        post.cover_image && (
          <Image src={post.cover_image.url} alt="" fill sizes="21rem" className="object-cover" />
        )
      }
      renderCenter={(post) => {
        const href = `/blog/${post.slug}`;
        return (
          <>
            {post.cover_image && (
              <Image
                src={post.cover_image.url}
                alt={post.cover_image.alt || post.title}
                fill
                priority
                sizes="(min-width: 1024px) 26rem, (min-width: 640px) 23rem, 19rem"
                className="object-cover"
              />
            )}

            <div
              className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-surface/85 to-transparent"
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface/90 to-transparent"
              aria-hidden="true"
            />

            {/* 1 — category and title, top. Also the stretched click target
                for the card itself, same ::after pattern as the vehicle
                showcase and VehicleCard. */}
            <div className="absolute inset-x-4 top-4">
              <p className="eyebrow text-steel-muted/90">{post.category.replace(/-/g, ' ')}</p>
              <Link href={href} className="mt-1 block after:absolute after:inset-0">
                <span className="line-clamp-2 font-display text-lg font-semibold leading-tight tracking-tight text-chrome sm:text-xl">
                  {post.title}
                </span>
              </Link>
            </div>

            {/* 2 — reading time, left. */}
            <span className="absolute left-4 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1.5 border border-chrome/70 bg-surface/70 px-3 py-2 font-data text-[0.65rem] uppercase tracking-wide text-chrome backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {post.reading_minutes} min
            </span>

            {/* 3 — the article, right. */}
            <Link
              href={href}
              className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1.5 border border-volt/60 bg-volt/10 px-3 py-2 font-data text-[0.65rem] uppercase tracking-wide text-volt backdrop-blur-sm transition-colors hover:bg-volt hover:text-surface"
            >
              Read
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>

            {/* 4 — author and date, bottom, in place of the vehicle
                showcase's price — the number that matters on a listing has
                no equivalent here, so this stays informational rather than
                inventing a fake "price"-shaped element. */}
            <div className="absolute inset-x-4 bottom-4 flex items-baseline justify-between font-data text-xs text-steel-muted">
              <span>{post.author}</span>
              <time dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString('en-RW', { dateStyle: 'medium' })}
              </time>
            </div>
          </>
        );
      }}
    />
  );
}
