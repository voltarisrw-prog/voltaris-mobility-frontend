import type { Metadata } from 'next';
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
    <ol className="mt-8 grid gap-8 sm:grid-cols-2">
      {steps.map((step) => (
        <li key={step.n} className="border-t border-hairline pt-6">
          <span className="font-data text-eyebrow text-volt">{step.n}</span>
          <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-steel">{step.body}</p>
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

      <section className="mt-14">
        <h2 className="eyebrow">Buying</h2>
        <Steps steps={howItWorks.buying} />
      </section>

      <div className="lane-rule my-16" />

      <section>
        <h2 className="eyebrow">Selling</h2>
        <Steps steps={howItWorks.selling} />
      </section>
    </div>
  );
}
