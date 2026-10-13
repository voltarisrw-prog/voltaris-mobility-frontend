import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { company, lastUpdated, terms } from '@/content/legal';
import { buildMetadata } from '@/lib/seo/metadata';
import { homeFonts } from '@/features/home/landing/fonts';
import { LegalDocument } from '@/features/legal/LegalDocument';

export const metadata: Metadata = buildMetadata({
  title: terms.title,
  description:
    'The terms governing use of the Voltaris Mobility marketplace.',
  path: '/legal/terms',
});

export default function TermsPage() {
  return (
    <div className={`lg-page ${homeFonts}`}>
      <LegalDocument
        crumbs={<Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: terms.title, path: '/legal/terms' }]} />}
        title={terms.title}
        intro={terms.intro}
        updated={lastUpdated}
        path="/legal/terms"
        sections={terms.sections.map((s) => ({ heading: s.heading, body: s.body }))}
        keyPoints={[
          { section: 'What Voltaris is', text: 'The contract of sale is between you and the seller unless we state otherwise in writing for a specific vehicle.' },
          { section: 'What verification means', text: 'It is not a warranty, a guarantee of mechanical condition, or a valuation.' },
          { section: 'Pricing', text: 'Prices shown are the price to you.' },
        ]}
        contact={{ label: 'Email', email: company.email }}
      />
    </div>
  );
}
