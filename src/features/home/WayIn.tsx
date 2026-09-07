'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { DEMO_LIBRARY_IMAGES } from '@/lib/mock/demoLibraryImages';

const MOVES = [
  {
    number: '01',
    title: 'City',
    description: 'Easy electric and hybrid options for everyday urban driving',
    href: '/cars?use=city',
    image: DEMO_LIBRARY_IMAGES[2]!,
  },
  {
    number: '02',
    title: 'Family',
    description: 'More room for people, luggage and weekends away',
    href: '/cars?use=family',
    image: DEMO_LIBRARY_IMAGES[10]!,
  },
  {
    number: '03',
    title: 'Business',
    description: 'Comfortable vehicles for work, clients and daily movement',
    href: '/cars?use=business',
    image: DEMO_LIBRARY_IMAGES[18]!,
  },
  {
    number: '04',
    title: 'Long distance',
    description: 'Go farther with vehicles suited to longer journeys',
    href: '/cars?use=long-distance',
    image: DEMO_LIBRARY_IMAGES[27]!,
  },
  {
    number: '05',
    title: 'Upcountry',
    description: "Practical choices for Rwanda's changing roads and terrain",
    href: '/cars?use=upcountry',
    image: DEMO_LIBRARY_IMAGES[37]!,
  },
  {
    number: '06',
    title: 'Everyday',
    description: 'Versatile vehicles for whatever the day brings',
    href: '/cars?use=everyday',
    image: DEMO_LIBRARY_IMAGES[46]!,
  },
] as const;

export function WayIn() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative isolate overflow-hidden border-b border-[color:var(--vds-border)] bg-[color:var(--vds-bg)]">
      <div className="shell py-16 sm:py-20 lg:py-28">
        <header className="mb-12 max-w-4xl sm:mb-16 lg:mb-20">
          <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
            Find your fit
          </p>

          <h2 className="mt-4 max-w-3xl font-display text-5xl leading-[0.86] tracking-[-0.045em] sm:text-6xl lg:text-8xl">
            Choose the way you move
          </h2>

          <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-[color:var(--vds-text-muted)] sm:text-lg">
            Find a vehicle around what your life actually looks like
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
          {MOVES.map((move, index) => {
            const isActive = active === index;

            const layout =
              index === 0 || index === 1
                ? 'lg:col-span-6 min-h-[30rem] sm:min-h-[34rem] lg:min-h-[42rem]'
                : 'lg:col-span-4 min-h-[25rem] sm:min-h-[29rem] lg:min-h-[34rem]';

            return (
              <Link
                key={move.title}
                href={move.href}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className={`group relative overflow-hidden border border-white/10 bg-[#0f0c09] outline-none ${layout}`}
              >
                <Image
                  src={move.image}
                  alt={`${move.title} vehicle selection`}
                  fill
                  priority={index < 2}
                  sizes={
                    index < 2
                      ? '(max-width: 768px) 100vw, 50vw'
                      : '(max-width: 768px) 100vw, 33vw'
                  }
                  className="object-cover object-center transition-transform duration-[1400ms] ease-out group-hover:scale-[1.07] group-focus-visible:scale-[1.07]"
                />

                {/* Cinematic image treatment */}
                <div
                  className={[
                    'absolute inset-0 transition-opacity duration-700',
                    isActive ? 'opacity-100' : 'opacity-70',
                  ].join(' ')}
                  aria-hidden="true"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(8,6,4,0.18) 0%, rgba(8,6,4,0.02) 35%, rgba(8,6,4,0.9) 100%)',
                  }}
                />

                <div
                  className={[
                    'absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent transition-opacity duration-700',
                    isActive ? 'opacity-100' : 'opacity-0',
                  ].join(' ')}
                  aria-hidden="true"
                />

                {/* Top row */}
                <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-5 sm:p-7">
                  <span className="font-data text-[0.58rem] tracking-[0.18em] text-white/75">
                    {move.number}
                  </span>

                  <span
                    className={[
                      'flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-500 sm:h-12 sm:w-12',
                      isActive
                        ? 'border-[color:var(--vds-brand-secondary)] bg-[color:var(--vds-brand-secondary)] text-[#0c0906]'
                        : 'border-white/25 bg-black/10 text-white group-hover:border-white',
                    ].join(' ')}
                  >
                    <ArrowUpRight
                      className={[
                        'h-4 w-4 transition-transform duration-500',
                        isActive
                          ? 'rotate-0'
                          : '-rotate-45 group-hover:rotate-0 group-focus-visible:rotate-0',
                      ].join(' ')}
                      aria-hidden="true"
                    />
                  </span>
                </div>

                {/* Bottom content */}
                <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:p-9">
                  <h3 className="font-display text-5xl leading-[0.86] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
                    {move.title}
                  </h3>

                  <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-white/70 sm:text-base">
                    {move.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4">
                    <span className="font-data text-[0.56rem] uppercase tracking-[0.16em] text-white/60">
                      Find your fit
                    </span>

                    <span className="inline-flex items-center gap-2 font-data text-[0.58rem] uppercase tracking-[0.16em] text-white transition-colors group-hover:text-[color:var(--vds-brand-secondary)]">
                      Explore vehicles
                      <ArrowUpRight
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
