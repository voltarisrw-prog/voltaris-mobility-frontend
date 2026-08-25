import type { Metadata } from 'next';
import { site } from '@/config/site';

export interface MetaInput {
  title: string;
  description: string;
  /** Path only, e.g. `/cars?make=byd`. Canonical is derived from it. */
  path: string;
  image?: { url: string; width: number; height: number; alt: string };
  noindex?: boolean;
  /** Set false to emit `noindex, nofollow` instead of `noindex, follow`. */
  follow?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}

const DEFAULT_OG = {
  url: '/brand/voltaris-logo-full.jpeg',
  width: 800,
  height: 800,
  alt: 'Voltaris Mobility',
};

export function absoluteUrl(path: string): string {
  return new URL(path, site.url).toString();
}

/**
 * Single source of page metadata. Pages describe themselves through this function
 * so title format, canonical rules, and social cards stay consistent as routes grow.
 */
export function buildMetadata(input: MetaInput): Metadata {
  const {
    title,
    description,
    path,
    image = DEFAULT_OG,
    noindex,
    follow = true,
    type = 'website',
  } = input;
  const canonical = absoluteUrl(path);
  const ogImage = { ...image, url: absoluteUrl(image.url) };

  return {
    title,
    description,
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
        },
    openGraph: {
      type,
      title,
      description,
      url: canonical,
      siteName: site.name,
      locale: site.locale,
      images: [ogImage],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage.url] },
  };
}

/** Title casing used across the marketplace: "<page> | Voltaris Mobility". */
export function pageTitle(value: string): string {
  return `${value} | ${site.name}`;
}
