import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { about } from '@/content/legal';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'About Voltaris Mobility',
  description:
    'Voltaris is a vehicle marketplace built in Kigali, for Rwanda. We connect buyers with dealers and owners, and check the paperwork before a listing goes live.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="shell py-10">
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]} />

      <header className="mt-8 max-w-3xl">
        <p className="eyebrow">Born in Kigali</p>
        <h1 className="mt-4 font-display text-display">{about.lead}</h1>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="max-w-prose space-y-6">
          {about.body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="text-base leading-relaxed text-steel">
              {paragraph}
            </p>
          ))}
        </div>

        <dl className="space-y-8">
          {about.values.map((value) => (
            <div key={value.title} className="border-t border-hairline pt-5">
              <dt className="font-display text-base font-semibold tracking-tight">{value.title}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-steel">{value.body}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-16 flex flex-wrap gap-3">
        <Link
          href="/cars"
          className="bg-volt px-6 py-3.5 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright"
        >
          Browse vehicles
        </Link>
        <Link
          href="/contact"
          className="border border-chrome px-6 py-3.5 font-data text-eyebrow uppercase transition-colors hover:bg-chrome hover:text-surface"
        >
          Talk to us
        </Link>
      </div>
    </div>
  );
}
