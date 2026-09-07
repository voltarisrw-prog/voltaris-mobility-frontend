import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, CarFront, GitCompare, SearchCheck } from 'lucide-react';

const CONFIDENCE_POINTS = [
  {
    number: '01',
    icon: SearchCheck,
    title: 'Know what you are buying',
    description:
      'See the details that matter before you make a decision, from price and mileage to range, battery and condition',
    href: '/cars',
    action: 'Browse vehicles',
  },
  {
    number: '02',
    icon: BadgeCheck,
    title: 'Buy with more confidence',
    description:
      'Explore verified listings and understand more about the vehicle and the people behind the listing',
    href: '/trust-and-verification',
    action: 'How verification works',
  },
  {
    number: '03',
    icon: CarFront,
    title: 'See it before you decide',
    description:
      'When you find something you like, take the next step and arrange a test drive before committing',
    href: '/test-drive',
    action: 'Book a test drive',
  },
  {
    number: '04',
    icon: GitCompare,
    title: 'Compare before you choose',
    description:
      'Put your options side by side and find the vehicle that makes the most sense for your needs',
    href: '/compare',
    action: 'Compare vehicles',
  },
] as const;

export function FinalStatement() {
  return (
    <section
      aria-labelledby="confidence-title"
      className="border-y border-[color:var(--vds-border)] bg-[#0c0906]"
    >
      <div className="shell py-20 sm:py-24 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
              Before you buy
            </p>

            <h2
              id="confidence-title"
              className="mt-4 max-w-xl font-display text-[clamp(3.8rem,8vw,7rem)] leading-[0.82] tracking-[-0.055em]"
            >
              Buy with
              <br />
              more confidence
            </h2>

            <p className="mt-7 max-w-md font-sans text-base leading-relaxed text-[color:var(--vds-text-muted)] sm:text-lg">
              Everything you need to move from browsing to a decision you feel
              good about
            </p>

            <Link
              href="/cars"
              className="group mt-8 inline-flex items-center gap-3 border-b border-[color:var(--vds-border)] pb-2 font-data text-[0.62rem] uppercase tracking-[0.16em] transition-colors hover:border-[color:var(--vds-brand-secondary)] hover:text-[color:var(--vds-brand-secondary)] focus-visible:border-[color:var(--vds-brand-secondary)] focus-visible:text-[color:var(--vds-brand-secondary)]"
            >
              Start exploring
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="grid gap-px overflow-hidden border border-[color:var(--vds-border)] bg-[color:var(--vds-border)] sm:grid-cols-2">
            {CONFIDENCE_POINTS.map((point) => {
              const Icon = point.icon;

              return (
                <Link
                  key={point.number}
                  href={point.href}
                  className="group relative flex min-h-[19rem] flex-col justify-between bg-[#0f0c09] p-6 transition-colors duration-500 hover:bg-[#15110d] focus-visible:bg-[#15110d] sm:min-h-[23rem] sm:p-8 lg:p-9"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-data text-[0.58rem] tracking-[0.16em] text-[color:var(--vds-text-muted)]">
                      {point.number}
                    </span>

                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--vds-border)] transition-all duration-300 group-hover:border-[color:var(--vds-brand-secondary)] group-hover:bg-[color:var(--vds-brand-secondary)] group-hover:text-[#0c0906]">
                      <Icon
                        className="h-4 w-4"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </span>
                  </div>

                  <div>
                    <h3 className="max-w-xs font-display text-3xl leading-[0.92] tracking-[-0.025em] sm:text-4xl">
                      {point.title}
                    </h3>

                    <p className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-[color:var(--vds-text-secondary)]">
                      {point.description}
                    </p>

                    <span className="mt-6 inline-flex items-center gap-2 border-b border-white/20 pb-1.5 font-data text-[0.56rem] uppercase tracking-[0.16em] text-[color:var(--vds-text-secondary)] transition-colors group-hover:border-[color:var(--vds-brand-secondary)] group-hover:text-[color:var(--vds-brand-secondary)]">
                      {point.action}
                      <ArrowUpRight
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
