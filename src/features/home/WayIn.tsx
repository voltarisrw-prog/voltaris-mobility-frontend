'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

const MOVES = [
  {
    number: '01',
    title: 'City',
    description: 'Easy electric and hybrid options for everyday urban driving',
    href: '/cars?use=city',
    accent: 'from-cyan-300/20 via-transparent to-transparent',
  },
  {
    number: '02',
    title: 'Family',
    description: 'More room for people, luggage and weekends away',
    href: '/cars?use=family',
    accent: 'from-amber-200/20 via-transparent to-transparent',
  },
  {
    number: '03',
    title: 'Business',
    description: 'Comfortable vehicles for work, clients and daily movement',
    href: '/cars?use=business',
    accent: 'from-violet-300/20 via-transparent to-transparent',
  },
  {
    number: '04',
    title: 'Long distance',
    description: 'Go farther with vehicles suited to longer journeys',
    href: '/cars?use=long-distance',
    accent: 'from-emerald-300/20 via-transparent to-transparent',
  },
  {
    number: '05',
    title: 'Upcountry',
    description: "Practical choices for Rwanda's changing roads and terrain",
    href: '/cars?use=upcountry',
    accent: 'from-orange-300/20 via-transparent to-transparent',
  },
  {
    number: '06',
    title: 'Everyday',
    description: 'Versatile vehicles for whatever the day brings',
    href: '/cars?use=everyday',
    accent: 'from-sky-300/20 via-transparent to-transparent',
  },
] as const;

export function WayIn() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative isolate overflow-hidden border-b border-[color:var(--vds-border)] bg-[color:var(--vds-bg)]">
      <div className="shell py-16 sm:py-20 lg:py-28">
        <header className="mb-12 max-w-3xl sm:mb-16 lg:mb-20">
          <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
            Find your fit
          </p>

          <h2 className="mt-4 max-w-2xl text-5xl leading-[0.9] sm:text-6xl lg:text-8xl">
            Choose the way you move
          </h2>

          <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-[color:var(--vds-text-muted)] sm:text-lg">
            Find a vehicle around what your life actually looks like
          </p>
        </header>

        <div className="grid gap-px overflow-hidden border border-[color:var(--vds-border)] bg-[color:var(--vds-border)] sm:grid-cols-2 lg:grid-cols-3">
          {MOVES.map((move, index) => {
            const isActive = active === index;

            return (
              <Link
                key={move.title}
                href={move.href}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className="group relative min-h-[20rem] overflow-hidden bg-[#0f0c09] p-6 outline-none transition-colors duration-500 hover:bg-[#15110d] focus-visible:bg-[#15110d] sm:min-h-[23rem] sm:p-8 lg:min-h-[27rem] lg:p-9"
              >
                <div
                  className={[
                    'absolute inset-0 bg-gradient-to-br transition-opacity duration-700',
                    move.accent,
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
                  ].join(' ')}
                  aria-hidden="true"
                />

                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-data text-[0.58rem] tracking-[0.16em] text-[color:var(--vds-text-muted)]">
                      {move.number}
                    </span>

                    <span
                      className={[
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all duration-500 sm:h-12 sm:w-12',
                        isActive
                          ? 'border-[color:var(--vds-brand-secondary)] bg-[color:var(--vds-brand-secondary)] text-[#0c0906]'
                          : 'border-[color:var(--vds-border)] text-[color:var(--vds-text)] group-hover:border-white group-focus-visible:border-white',
                      ].join(' ')}
                    >
                      <ArrowUpRight
                        className={[
                          'h-4 w-4 transition-transform duration-500',
                          isActive ? 'rotate-0' : '-rotate-45 group-hover:rotate-0 group-focus-visible:rotate-0',
                        ].join(' ')}
                        aria-hidden="true"
                      />
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-4xl leading-none tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                      {move.title}
                    </h3>

                    <p className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-[color:var(--vds-text-muted)] sm:text-base">
                      {move.description}
                    </p>

                    <span className="mt-6 inline-flex border-b border-white/20 pb-1.5 font-data text-[0.56rem] uppercase tracking-[0.16em] text-[color:var(--vds-text-secondary)] transition-colors group-hover:border-[color:var(--vds-brand-secondary)] group-hover:text-[color:var(--vds-brand-secondary)]">
                      Explore vehicles
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
