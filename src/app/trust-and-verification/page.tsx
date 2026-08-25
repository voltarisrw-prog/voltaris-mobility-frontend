import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { trust } from '@/content/legal';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Trust and verification',
  description:
    'What the Voltaris verified mark means: ownership documents matched, import and duty status confirmed, battery health read from the vehicle, and a physical inspection.',
  path: '/trust-and-verification',
});

export default function TrustPage() {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Trust and verification', path: '/trust-and-verification' },
  ];

  return (
    <div className="shell py-10">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <Breadcrumbs trail={trail} />

      <header className="mt-8 max-w-2xl">
        <h1 className="font-display text-display">{trust.title}</h1>
        <p className="mt-5 text-base leading-relaxed text-steel">{trust.intro}</p>
      </header>

      <ol className="mt-14 grid gap-px bg-hairline sm:grid-cols-2">
        {trust.checks.map((check, index) => (
          <li key={check.title} className="bg-surface p-7">
            <span className="font-data text-eyebrow text-volt">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold tracking-tight">
              {check.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-steel">{check.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <section className="border border-volt/25 bg-volt-wash p-7">
          <h2 className="font-display text-lg font-semibold tracking-tight">{trust.badge.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-steel">{trust.badge.body}</p>
        </section>

        {/* Stating the limits is what makes the claims above credible. */}
        <section className="border border-hairline p-7">
          <h2 className="font-display text-lg font-semibold tracking-tight">{trust.limits.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-steel">{trust.limits.body}</p>
        </section>
      </div>

      <section className="mt-14 max-w-prose">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {trust.reporting.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-steel">{trust.reporting.body}</p>
      </section>

      <div className="mt-14 flex flex-wrap gap-3">
        <Link
          href="/cars?verified=true"
          className="bg-volt px-6 py-3.5 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright"
        >
          Browse verified vehicles
        </Link>
        <Link
          href="/how-it-works"
          className="border border-chrome px-6 py-3.5 font-data text-eyebrow uppercase transition-colors hover:bg-chrome hover:text-surface"
        >
          How it works
        </Link>
      </div>
    </div>
  );
}
