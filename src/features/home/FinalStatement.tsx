'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, CarFront, GitCompare, SearchCheck } from 'lucide-react';
import { useState } from 'react';

const CONFIDENCE_POINTS = [
  {
    number: '01',
    icon: SearchCheck,
    title: 'Know what you are buying',
    description:
      'See the details that matter before you make a decision, from price and mileage to range, battery and condition',
    href: '/cars',
    action: 'Browse vehicles',
    image: '/hero/gallery/hero-01.png',
  },
  {
    number: '02',
    icon: BadgeCheck,
    title: 'Buy with more confidence',
    description:
      'Explore verified listings and understand more about the vehicle and the people behind the listing',
    href: '/trust-and-verification',
    action: 'How verification works',
    image: '/hero/gallery/hero-02.png',
  },
  {
    number: '03',
    icon: CarFront,
    title: 'See it before you decide',
    description:
      'When you find something you like, take the next step and arrange a test drive before committing',
    href: '/test-drive',
    action: 'Book a test drive',
    image: '/hero/gallery/hero-03.png',
  },
  {
    number: '04',
    icon: GitCompare,
    title: 'Compare before you choose',
    description:
      'Put your options side by side and find the vehicle that makes the most sense for your needs',
    href: '/compare',
    action: 'Compare vehicles',
    image: '/hero/gallery/hero-04.png',
  },
] as const;

export function FinalStatement() {
  const [active, setActive] = useState(0);

  return (
    <section
      aria-labelledby="confidence-title"
      className="border-y border-[color:var(--vds-border)] bg-[#0c0906]"
    >
      <div className="shell py-16 sm:py-20 lg:py-28">
        <div className="max-w-4xl">
          <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
            Before you buy
          </p>

          <h2
            id="confidence-title"
            className="mt-4 max-w-4xl font-display text-[clamp(3.8rem,9vw,8.5rem)] leading-[0.8] tracking-[-0.055em]"
          >
            Buy with
            <br />
            more confidence
          </h2>

          <p className="mt-7 max-w-2xl font-sans text-base leading-relaxed text-[color:var(--vds-text-muted)] sm:text-lg">
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

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-20">
          {CONFIDENCE_POINTS.map((point, index) => {
            const Icon = point.icon;
            const isActive = active === index;

            return (
              <Link
                key={point.number}
                href={point.href}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className="group relative min-h-[28rem] overflow-hidden border border-white/10 bg-[#0f0c09] outline-none sm:min-h-[32rem] lg:min-h-[37rem]"
              >
                <Image
                  src={point.image}
                  alt=""
                  fill
                  priority={index < 2}
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-[1400ms] ease-out group-hover:scale-[1.07] group-focus-visible:scale-[1.07]"
                />

                <div
                  className="absolute inset-0"
                  aria-hidden="true"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(8,6,4,0.18) 0%, rgba(8,6,4,0.05) 30%, rgba(8,6,4,0.94) 100%)',
                  }}
                />

                <div
                  className={[
                    'absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent transition-opacity duration-700',
                    isActive ? 'opacity-100' : 'opacity-0',
                  ].join(' ')}
                  aria-hidden="true"
                />

                <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-5 sm:p-7">
                  <span className="font-data text-[0.58rem] tracking-[0.18em] text-white/75">
                    {point.number}
                  </span>

                  <span
                    className={[
                      'flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-500 sm:h-12 sm:w-12',
                      isActive
                        ? 'border-[color:var(--vds-brand-secondary)] bg-[color:var(--vds-brand-secondary)] text-[#0c0906]'
                        : 'border-white/25 bg-black/10 text-white group-hover:border-white',
                    ].join(' ')}
                  >
                    <Icon
                      className="h-4 w-4"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:p-9">
                  <h3 className="max-w-xl font-display text-4xl leading-[0.86] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                    {point.title}
                  </h3>

                  <p className="mt-4 max-w-lg font-sans text-sm leading-relaxed text-white/70 sm:text-base">
                    {point.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4">
                    <span className="font-data text-[0.56rem] uppercase tracking-[0.16em] text-white/55">
                      Before you buy
                    </span>

                    <span className="inline-flex items-center gap-2 font-data text-[0.58rem] uppercase tracking-[0.16em] text-white transition-colors group-hover:text-[color:var(--vds-brand-secondary)]">
                      {point.action}
                      <ArrowUpRight
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
