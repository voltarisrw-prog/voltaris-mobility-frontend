import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { help } from '@/content/legal';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { homeFonts } from '@/features/home/landing/fonts';
import { HelpExplorer } from '@/features/help/HelpExplorer';
import '@/features/help/help.css';

export const metadata: Metadata = buildMetadata({
  title: 'Help',
  description:
    'Answers on buying, selling, charging, and accounts on Voltaris — the questions people actually ask.',
  path: '/help',
});

export default function HelpPage() {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Help', path: '/help' },
  ];

  // FAQPage structured data is only valid when the questions are genuinely
  // rendered on the page, which they are: every answer is in the page, even when collapsed.
  const allFaqs = help.sections.flatMap((section) =>
    section.faqs.map((faq) => ({ question: faq.q, answer: faq.a })),
  );
  const sections = help.sections.map((s) => ({
    heading: s.heading,
    faqs: s.faqs.map((f) => ({ q: f.q, a: f.a })),
  }));

  return (
    <div className={`hp-page ${homeFonts}`}>
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <JsonLd data={faqJsonLd(allFaqs)} />
      <div className="hp-w">
        <Breadcrumbs trail={trail} />

        <h1 className="hp-h1">
          <span className="hp-wd">
            <span className="hp-wi">{help.title}</span>
          </span>
        </h1>
        <p className="hp-lead">{help.intro}</p>

        <HelpExplorer sections={sections} contactHref="/contact" />

        <section className="hp-stuck">
          <Image src="/demo/lifestyle/dealership-handshake.jpg" alt="" fill sizes="100vw" className="hp-sim" />
          <div>
            <small>Need a hand?</small>
            <h2>Still stuck?</h2>
            <p>A person reads every message and replies within a working day.</p>
          </div>
          <Link href="/contact" className="hp-big">
            Contact us
            <span>
              <ArrowRight size={24} strokeWidth={2.4} />
            </span>
          </Link>
        </section>
      </div>
    </div>
  );
}
