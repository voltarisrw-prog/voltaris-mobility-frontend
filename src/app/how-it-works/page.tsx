import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { howItWorks } from '@/content/legal';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'How Voltaris works',
  description:
    'Finding, comparing, test driving and buying a vehicle through Voltaris — and how selling one works.',
  path: '/how-it-works',
});

function Steps({ steps }: { steps: { n: string; title: string; body: string }[] }) {
  return (
    <ol className="mt-8 grid gap-4 sm:grid-cols-2">
      {steps.map((step) => (
        <li
          key={step.n}
          className="group relative min-h-[260px] overflow-hidden rounded-[2.75rem] border border-black/10 bg-white p-7 text-black shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(0,0,0,0.24)] sm:p-8 lg:min-h-[280px] lg:p-9"
        >
          <div className="flex items-start justify-between gap-6">
            <span className="font-data text-[10px] uppercase tracking-[0.18em] text-black/50">
              {step.n}
            </span>

            <span className="font-display text-5xl font-semibold leading-none tracking-[-0.06em] text-black/[0.07] transition-all duration-500 group-hover:text-black/[0.14]">
              {step.n}
            </span>
          </div>

          <div className="mt-16 max-w-md">
            <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight text-black transition-transform duration-500 group-hover:translate-x-1">
              {step.title}
            </h3>

            <p className="mt-3 max-w-sm text-sm leading-6 text-black/55">
              {step.body}
            </p>
          </div>

          <div className="absolute bottom-7 right-7 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black/45 transition-all duration-500 group-hover:border-black group-hover:bg-black group-hover:text-white">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>

          <div className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-black transition-transform duration-500 group-hover:scale-x-100" />
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="shell py-10">
      <Breadcrumbs
        trail={[{ name: 'Home', path: '/' }, { name: 'How it works', path: '/how-it-works' }]}
      />
      <h1 className="mt-8 font-display text-display">{howItWorks.title}</h1>

      <section className="mt-16">
        <div className="flex items-end justify-between gap-6 border-b border-hairline pb-5">
          <div>
            <p className="eyebrow text-volt">01 / Buying</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-chrome sm:text-4xl">
              Find the right car.
            </h2>
          </div>

          <span className="hidden font-data text-[9px] uppercase tracking-[0.18em] text-steel-muted sm:block">
            From search to keys
          </span>
        </div>

        <Steps steps={howItWorks.buying} />
      </section>

      <div className="lane-rule my-20" />

      <section>
        <div className="flex items-end justify-between gap-6 border-b border-hairline pb-5">
          <div>
            <p className="eyebrow text-volt">02 / Selling</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-chrome sm:text-4xl">
              Turn your car into a listing.
            </h2>
          </div>

          <span className="hidden font-data text-[9px] uppercase tracking-[0.18em] text-steel-muted sm:block">
            From listing to sale
          </span>
        </div>

        <Steps steps={howItWorks.selling} />
      </section>
    </div>
  );
}
