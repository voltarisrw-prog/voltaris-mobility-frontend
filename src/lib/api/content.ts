import { request } from './client';
import type { Page } from '@/types/api';

/**
 * BACKEND DEPENDENCY
 *   GET /content/articles            paginated, filterable by kind and category
 *   GET /content/articles/{slug}
 *   GET /content/categories
 *   GET /content/sitemap
 *
 * `kind` separates two things that look similar and behave differently:
 *
 *   guide — evergreen and maintained. "How to check battery health" should stay
 *           accurate for years and is edited in place. Ranked on the topic.
 *   blog  — dated and immutable. Company news, market updates, launches. Ranked
 *           on freshness, and correct to leave untouched once published.
 *
 * They share a store because the shape is identical; they get separate routes
 * because search intent and update policy differ. Mixing them means either
 * stale-dating the guides or perpetually rewriting the announcements.
 */

export type ArticleKind = 'guide' | 'blog';

export type ArticleCategory =
  | 'buying-guides'
  | 'reviews'
  | 'comparisons'
  | 'charging'
  | 'ownership'
  | 'maintenance'
  | 'market'
  | 'news'
  | 'owner-stories'
  | 'insights';

export interface ArticleSummary {
  slug: string;
  kind: ArticleKind;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  cover_image: { url: string; alt: string; width: number; height: number } | null;
  author: string;
  reading_minutes: number;
  published_at: string;
  updated_at: string;
}

export interface Article extends ArticleSummary {
  /** Pre-sanitised HTML from the CMS. See the note in the article page component. */
  body_html: string;
  faqs: { question: string; answer: string }[];
  related_slugs: string[];
}

export function listArticles(
  params: { category?: string; page?: number } = {},
): Promise<Page<ArticleSummary>> {
  return request<Page<ArticleSummary>>('/content/articles', {
    query: { ...params },
    revalidate: 900,
  });
}

export function getArticle(slug: string): Promise<Article> {
  return request<Article>(`/content/articles/${encodeURIComponent(slug)}`, {
    revalidate: 1800,
    tags: [`article:${slug}`],
  });
}

export function getArticleSitemap(): Promise<Page<{ slug: string; updated_at: string }>> {
  return request<Page<{ slug: string; updated_at: string }>>('/content/sitemap', {
    revalidate: 3600,
  });
}

/** Blog posts, newest first. Shorter revalidation than guides — news goes stale. */
export function listPosts(
  params: { category?: string; page?: number } = {},
): Promise<Page<ArticleSummary>> {
  return request<Page<ArticleSummary>>('/content/articles', {
    query: { kind: 'blog', ...params },
    revalidate: 300,
  });
}

/** Slugs and dates for the blog sitemap and RSS feed. */
export function listPostSitemap(): Promise<Page<{ slug: string; updated_at: string }>> {
  return request<Page<{ slug: string; updated_at: string }>>('/content/sitemap', {
    query: { kind: 'blog' },
    revalidate: 3600,
  });
}
