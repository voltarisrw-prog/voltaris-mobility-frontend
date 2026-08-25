import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { careers, company } from '@/content/legal';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Careers',
  description: 'Working at Voltaris Mobility in Kigali.',
  path: '/careers',
});

export default function CareersPage() {
  return (
    <div className="shell py-10">
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Careers', path: '/careers' }]} />

      <header className="mt-8 max-w-2xl">
        <h1 className="font-display text-display">{careers.title}</h1>
        {/* Saying there are no vacancies is better than an empty listings page
            or a form that goes nowhere. */}
        <p className="mt-5 text-base leading-relaxed text-steel">{careers.intro}</p>
      </header>

      <section className="mt-14 max-w-2xl">
        <h2 className="eyebrow">Where we would make room</h2>
        <ul className="mt-5 divide-y divide-hairline/60 border-y border-hairline/60">
          {careers.interests.map((interest) => (
            <li key={interest} className="py-4 text-sm leading-relaxed text-steel">
              {interest}
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-prose text-sm leading-relaxed text-steel">{careers.closing}</p>
        <a
          href={`mailto:${company.email}`}
          className="mt-8 inline-block bg-volt px-6 py-3.5 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright"
        >
          {company.email}
        </a>
      </section>
    </div>
  );
}
