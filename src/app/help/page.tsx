import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { help } from '@/content/legal';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';

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
  // rendered on the page, which they are — every one below is visible.
  const allFaqs = help.sections.flatMap((section) =>
    section.faqs.map((faq) => ({ question: faq.q, answer: faq.a })),
  );

  return (
    <div className="shell py-10">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <JsonLd data={faqJsonLd(allFaqs)} />
      <Breadcrumbs trail={trail} />

      <header className="mt-8 max-w-2xl">
        <h1 className="font-display text-display">{help.title}</h1>
        <p className="mt-5 text-base leading-relaxed text-steel">{help.intro}</p>
      </header>

      <div className="mt-14 space-y-14">
        {help.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="eyebrow">{section.heading}</h2>
            <div className="mt-5 divide-y divide-hairline/60 border-y border-hairline/60">
              {section.faqs.map((faq) => (
                <details key={faq.q} className="py-5">
                  <summary className="cursor-pointer list-none font-display text-base font-semibold tracking-tight">
                    {faq.q}
                  </summary>
                  <p className="mt-3 max-w-prose text-sm leading-relaxed text-steel">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 border border-hairline p-8">
        <h2 className="font-display text-lg font-semibold tracking-tight">Still stuck?</h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-steel">
          A person reads every message and replies within a working day.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-block bg-volt px-6 py-3.5 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}
