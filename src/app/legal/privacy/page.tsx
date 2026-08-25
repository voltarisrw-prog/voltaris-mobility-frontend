import type { Metadata } from 'next';
import { ProsePage } from '@/components/ProsePage';
import { lastUpdated, privacy } from '@/content/legal';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: privacy.title,
  description:
    'What personal data Voltaris Mobility collects, why, who sees it, and your rights over it.',
  path: '/legal/privacy',
});

export default function PrivacyPage() {
  return (
    <ProsePage
      title={privacy.title}
      intro={privacy.intro}
      path="/legal/privacy"
      updated={lastUpdated}
      sections={privacy.sections}
    />
  );
}
