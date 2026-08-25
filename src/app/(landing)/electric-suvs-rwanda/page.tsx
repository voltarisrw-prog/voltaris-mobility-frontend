import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryLanding } from '@/features/vehicles/CategoryLanding';
import { findLandingPage } from '@/config/landing';
import { buildMetadata } from '@/lib/seo/metadata';

const SLUG = 'electric-suvs-rwanda';

export function generateMetadata(): Metadata {
  const page = findLandingPage(SLUG);
  if (!page) return {};
  return buildMetadata({ title: page.title, description: page.description, path: `/${SLUG}` });
}

export default function Page() {
  const page = findLandingPage(SLUG);
  if (!page) notFound();
  return <CategoryLanding page={page} />;
}
