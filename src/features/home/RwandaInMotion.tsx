'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

const MOVES = [
  {
    number: '01',
    title: 'Kigali',
    description:
      'Efficient electric and hybrid vehicles for everyday city driving',
    href: '/cars?location=kigali',
    image: '/hero/gallery/hero-01.png',
  },
  {
    number: '02',
    title: 'Across Rwanda',
    description:
      'Comfortable choices for longer journeys between cities and districts',
    href: '/cars',
    image: '/hero/gallery/hero-02.png',
  },
  {
    number: '03',
    title: 'Electric future',
    description:
      'Explore a new generation of vehicles built for cleaner everyday movement',
    href: '/cars?fuel=electric',
    image: '/hero/gallery/hero-03.png',
  },
] as const;

export function RwandaInMotion() {
  const [active, setActive] = useState(0);

  return (
    <section
      aria-labelledby="rwanda-in-motion-title"
      className="relative isolate overflow-hidden border-y border-[color:var(--vds-border)] bg-[#0c0906]"
    >
      <div className="shell py-16 sm:py-20 lg:py-28">
        <header className="max-w-5xl">
          <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
            Rwanda
          </p>

          <h2
            id="rwanda-in-motion-title"
            className="mt-4 max-w-5xl font-display text-[clamp(3.8rem,10vw,9rem)] leading-[0.8] tracking-[-0.055em] text-[color:var(--vds-text)]"
          >
            Made for how
            <br />
            Rwanda moves
          </h2>

          <p className="mt-7 max-w-2xl font-sans text-base leading-relaxed text-[color:var(--vds-text-secondary)] sm:text-lg">
            Discover electric and hybrid vehicles around the places you go,
            the journeys you make and the way you want to move
          </p>
        </header>

        <div className="mt-14 grid gap-4 md:grid-cols-3 lg:mt-20">
          {MOVES.map((move, index) => {
            const isActive = active === index;

            return (
              <Link
                key={move.title}
                href={move.href}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className="group relative min-h-[30rem] overflow-hidden border border-white/10 bg-[#0f0c09] outline-none sm:min-h-[34rem] lg:min-h-[40rem]"
              >
                <Image
                  src={move.image}
                  alt={`${move.title} vehicle selection`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center transition-transform duration-[1400ms] ease-out group-hover:scale-[1.07] group-focus-visible:scale-[1.07]"
                />

                <div
                  className="absolute inset-0 transition-opacity duration-700"
                  aria-hidden="true"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(8,6,4,0.2) 0%, rgba(8,6,4,0.02) 35%, rgba(8,6,4,0.92) 100%)',
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

                <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:p-9">
                  <p className="mb-3 font-data text-[0.56rem] uppercase tracking-[0.18em] text-white/55">
                    Rwanda in motion
                  </p>

                  <h3 className="font-display text-5xl leading-[0.86] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                    {move.title}
                  </h3>

                  <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-white/70 sm:text-base">
                    {move.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4">
                    <span className="font-data text-[0.56rem] uppercase tracking-[0.16em] text-white/55">
                      {move.number} / 03
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
