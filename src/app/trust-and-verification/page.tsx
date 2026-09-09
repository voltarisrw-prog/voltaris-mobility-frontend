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

      <header className="mt-10 border-b border-hairline pb-10 lg:mt-14 lg:pb-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-3xl">
            <p className="font-data text-[9px] uppercase tracking-[0.2em] text-volt">
              Trust / Verification
            </p>

            <h1 className="mt-4 font-display text-display tracking-[-0.04em]">
              {trust.title}
            </h1>
          </div>

          <p className="max-w-md text-sm leading-6 text-black/65 lg:pb-1">
            {trust.intro}
          </p>
        </div>
      </header>

      <ol className="mt-14 grid gap-4 sm:grid-cols-2">
        {trust.checks.map((check, index) => (
          <li
            key={check.title}
            className="group relative min-h-[240px] overflow-hidden border border-black/10 rounded-[2rem] bg-white p-7 shadow-[0_18px_50px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1 hover:border-black/20 sm:p-8"
          >
            <div className="flex items-start justify-between gap-6">
              <span className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
                Verification {String(index + 1).padStart(2, '0')}
              </span>

              <span className="font-display text-5xl font-semibold leading-none tracking-[-0.06em] text-white/[0.07] transition-colors duration-500 group-hover:text-white/[0.14]">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            <div className="mt-14 max-w-md">
              <h2 className="font-display text-xl font-semibold leading-tight tracking-tight text-black sm:text-2xl">
                {check.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-black/65">
                {check.body}
              </p>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-volt transition-transform duration-500 group-hover:scale-x-100" />
          </li>
        ))}
      </ol>

      <div className="mt-14 grid gap-4 lg:grid-cols-2">
        <section className="group relative overflow-hidden border border-volt/25 bg-volt-wash p-7 shadow-[0_18px_50px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1 hover:border-volt/40 sm:p-8">
          <div className="flex items-start justify-between gap-6">
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
              Verified mark
            </p>

            <span className="font-display text-4xl font-semibold leading-none tracking-[-0.06em] text-volt/20 transition-colors duration-500 group-hover:text-volt/35">
              ✓
            </span>
          </div>

          <h2 className="mt-10 font-display text-xl font-semibold leading-tight tracking-tight text-black sm:text-2xl">
            {trust.badge.title}
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-black/65">
            {trust.badge.body}
          </p>

          <div className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-volt transition-transform duration-500 group-hover:scale-x-100" />
        </section>

        {/* Stating the limits is what makes the claims above credible. */}
        <section className="group relative overflow-hidden border border-black/10 rounded-[2rem] bg-white p-7 shadow-[0_18px_50px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1 hover:border-black/20 sm:p-8">
          <div className="flex items-start justify-between gap-6">
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-black/45">
              Important limits
            </p>

            <span className="font-display text-4xl font-semibold leading-none tracking-[-0.06em] text-white/[0.07] transition-colors duration-500 group-hover:text-white/[0.14]">
              !
            </span>
          </div>

          <h2 className="mt-10 font-display text-xl font-semibold leading-tight tracking-tight text-black sm:text-2xl">
            {trust.limits.title}
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-black/65">
            {trust.limits.body}
          </p>

          <div className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-volt transition-transform duration-500 group-hover:scale-x-100" />
        </section>
      </div>

      <section className="group relative mt-14 overflow-hidden border border-black/10 rounded-[2rem] bg-white p-7 shadow-[0_18px_50px_rgba(0,0,0,0.12)] transition-all duration-500 hover:border-black/20 sm:p-8 lg:p-9">
        <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
          Report an issue
        </p>

        <div className="mt-4 max-w-2xl">
          <h2 className="font-display text-xl font-semibold leading-tight tracking-tight text-black sm:text-2xl">
            {trust.reporting.title}
          </h2>

          <p className="mt-3 text-sm leading-6 text-black/65">
            {trust.reporting.body}
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-volt transition-transform duration-500 group-hover:scale-x-100" />
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/cars?verified=true"
          className="group inline-flex w-fit items-center gap-3 bg-volt px-6 py-3.5 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright"
        >
          Browse verified vehicles
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>

        <Link
          href="/how-it-works"
          className="inline-flex w-fit items-center gap-3 border border-black/10 rounded-[2rem] bg-white px-6 py-3.5 font-data text-eyebrow uppercase text-black transition-all duration-300 hover:border-black/25 hover:bg-white/[0.025]"
        >
          How it works
          <span className="text-black/45">→</span>
        </Link>
      </div>
    </div>
  );
}
