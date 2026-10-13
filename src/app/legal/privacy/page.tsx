import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { company, lastUpdated, privacy } from '@/content/legal';
import { buildMetadata } from '@/lib/seo/metadata';
import { homeFonts } from '@/features/home/landing/fonts';
import { LegalDocument } from '@/features/legal/LegalDocument';

export const metadata: Metadata = buildMetadata({
  title: privacy.title,
  description:
    'What personal data Voltaris Mobility collects, why, who sees it, and your rights over it.',
  path: '/legal/privacy',
});

export default function PrivacyPage() {
  return (
    <div className={`lg-page ${homeFonts}`}>
      <LegalDocument
        crumbs={<Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: privacy.title, path: '/legal/privacy' }]} />}
        title={privacy.title}
        intro={privacy.intro}
        updated={lastUpdated}
        path="/legal/privacy"
        sections={privacy.sections.map((s) => ({ heading: s.heading, body: s.body }))}
        keyPoints={[
          { section: 'Who sees it', text: 'We do not sell personal data.' },
          { section: 'Payment details', text: 'We do not see or store card details.' },
          { section: 'Cookies', text: 'We do not use advertising cookies.' },
        ]}
        contact={{ label: 'Questions or complaints', email: company.privacyEmail }}
      />
    </div>
  );
}
