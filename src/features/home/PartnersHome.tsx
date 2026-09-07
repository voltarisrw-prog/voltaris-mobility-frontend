import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CircleDollarSign,
} from 'lucide-react';

const SELL_POINTS = [
  {
    number: '01',
    icon: Camera,
    title: 'Show your vehicle',
    description:
      'Create a listing with the photos and details buyers need to understand what you are offering',
  },
  {
    number: '02',
    icon: CircleDollarSign,
    title: 'Set your asking price',
    description:
      'Present your vehicle clearly with the price, mileage, condition and other important information',
  },
  {
    number: '03',
    icon: BadgeCheck,
    title: 'Build buyer confidence',
    description:
      'Give interested buyers a clearer picture of the vehicle before they get in touch',
  },
] as const;

export function PartnersHome() {
  return (
    <section
      aria-labelledby="sell-home-title"
      className="border-y border-[color:var(--vds-border)] bg-[#0c0906]"
    >
      <div className="shell py-20 sm:py-24 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-20">
          <div>
            <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
              Sell on Voltaris
            </p>

            <h2
              id="sell-home-title"
              className="mt-5 max-w-4xl font-display text-[clamp(4rem,9vw,8.5rem)] leading-[0.8] tracking-[-0.055em]"
            >
              Have a vehicle
              <br />
              to sell?
            </h2>
          </div>

          <div className="lg:pb-2">
            <p className="max-w-xl font-display text-[clamp(1.7rem,3vw,2.8rem)] leading-[0.95] tracking-[-0.025em] text-[color:var(--vds-text-secondary)]">
              Put your EV or hybrid in front of people looking for their next
              vehicle
            </p>

            <Link
              href="/sell"
              className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[color:var(--vds-text)] px-6 py-3 font-data text-[0.62rem] uppercase tracking-[0.14em] text-[#0c0906] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--vds-brand-secondary)] sm:mt-10"
            >
              Sell your vehicle
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden border border-[color:var(--vds-border)] bg-[color:var(--vds-border)] sm:grid-cols-3 lg:mt-20">
          {SELL_POINTS.map((point) => {
            const Icon = point.icon;

            return (
              <div
                key={point.number}
                className="group min-h-[19rem] bg-[#100d0a] p-6 sm:min-h-[22rem] sm:p-8 lg:p-9"
              >
                <div className="flex items-start justify-between">
                  <span className="font-data text-[0.58rem] tracking-[0.16em] text-[color:var(--vds-text-muted)]">
                    {point.number}
                  </span>

                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--vds-border)] text-[color:var(--vds-text-secondary)] transition-colors duration-300 group-hover:border-[color:var(--vds-brand-secondary)] group-hover:text-[color:var(--vds-brand-secondary)]">
                    <Icon
                      className="h-4 w-4"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </span>
                </div>

                <div className="mt-20 sm:mt-24">
                  <h3 className="font-display text-3xl leading-[0.9] tracking-[-0.025em] sm:text-4xl">
                    {point.title}
                  </h3>

                  <p className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-[color:var(--vds-text-secondary)]">
                    {point.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-[color:var(--vds-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl font-data text-[0.58rem] uppercase leading-[1.7] tracking-[0.12em] text-[color:var(--vds-text-muted)]">
            Selling an electric or hybrid vehicle starts with giving buyers
            the information they need
          </p>

          <Link
            href="/sell"
            className="group inline-flex w-fit items-center gap-2 font-data text-[0.6rem] uppercase tracking-[0.16em] text-[color:var(--vds-text-secondary)] transition-colors hover:text-[color:var(--vds-brand-secondary)]"
          >
            Start a listing
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
