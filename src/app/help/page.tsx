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
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {section.faqs.map((faq, index) => (
                <details
                  key={faq.q}
                  className="group relative overflow-hidden border border-hairline bg-slab p-6 shadow-[0_24px_70px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-1 hover:border-white/20 sm:p-7"
                >
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-start justify-between gap-5">
                      <span className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span className="font-display text-3xl font-semibold leading-none tracking-[-0.05em] text-white/[0.08] transition-colors duration-500 group-open:text-volt/30">
                        +
                      </span>
                    </div>

                    <h3 className="mt-10 max-w-md font-display text-xl font-semibold leading-tight tracking-tight text-chrome">
                      {faq.q}
                    </h3>
                  </summary>

                  <p className="mt-4 max-w-prose text-sm leading-6 text-steel">
                    {faq.a}
                  </p>

                  <div className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-volt transition-transform duration-500 group-hover:scale-x-100 group-open:scale-x-100" />
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="group relative mt-16 overflow-hidden border border-hairline bg-slab p-7 shadow-[0_24px_70px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/20 sm:p-9 lg:p-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
              Need a hand?
            </p>

            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-chrome sm:text-3xl">
              Still stuck?
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-steel">
              A person reads every message and replies within a working day.
            </p>
          </div>

          <Link
            href="/contact"
            className="group/link inline-flex w-fit items-center gap-3 bg-volt px-6 py-3.5 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright"
          >
            Contact us
            <span className="transition-transform duration-300 group-hover/link:translate-x-1">
              →
            </span>
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-volt transition-transform duration-500 group-hover:scale-x-100" />
      </div>
    </div>
  );
}
