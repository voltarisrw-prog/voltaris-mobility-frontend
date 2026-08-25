import type { Metadata } from 'next';
import { ProsePage } from '@/components/ProsePage';
import { lastUpdated, terms } from '@/content/legal';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: terms.title,
  description: 'The terms governing use of the Voltaris Mobility marketplace.',
  path: '/legal/terms',
});

export default function TermsPage() {
  return (
    <ProsePage
      title={terms.title}
      intro={terms.intro}
      path="/legal/terms"
      updated={lastUpdated}
      sections={terms.sections}
    />
  );
}
