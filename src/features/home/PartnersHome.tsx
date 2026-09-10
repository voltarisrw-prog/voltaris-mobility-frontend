'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  BadgeCheck,
  Camera,
  CircleDollarSign,
} from 'lucide-react';
import { useState } from 'react';

const SELL_POINTS = [
  {
    number: '01',
    icon: Camera,
    title: 'Show your vehicle',
    description:
      'Create a listing with the photos and details buyers need to understand what you are offering',
    image: '/hero/gallery/hero-02.png',
  },
  {
    number: '02',
    icon: CircleDollarSign,
    title: 'Set your asking price',
    description:
      'Present your vehicle clearly with the price, mileage, condition and other important information',
    image: '/hero/gallery/hero-03.png',
  },
  {
    number: '03',
    icon: BadgeCheck,
    title: 'Build buyer confidence',
    description:
      'Give interested buyers a clearer picture of the vehicle before they get in touch',
    image: '/hero/gallery/hero-05.jpeg',
  },
] as const;

export function PartnersHome() {
  const [active, setActive] = useState(0);

  return (
    <section
      aria-labelledby="sell-home-title"
      className="border-y border-[color:var(--vds-border)] bg-[#0c0906]"
    >
      <div className="shell py-16 sm:py-20 lg:py-28">
        <div className="max-w-5xl">
          <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
            Sell on Voltaris
          </p>

          <h2
            id="sell-home-title"
            className="mt-5 max-w-5xl font-display text-[clamp(4rem,9vw,8.5rem)] leading-[0.8] tracking-[-0.055em]"
          >
            Have a vehicle
            <br />
            to sell?
          </h2>

          <p className="mt-7 max-w-2xl font-display text-[clamp(1.7rem,3vw,2.8rem)] leading-[0.95] tracking-[-0.025em] text-[color:var(--vds-text-secondary)]">
            Put your EV or hybrid in front of people looking for their next
            vehicle
          </p>

          <Link
            href="/sell"
            className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[color:var(--vds-text)] px-6 py-3 font-data text-[0.62rem] uppercase tracking-[0.14em] text-[#0c0906] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--vds-brand-secondary)] sm:mt-10"
          >
            Sell your vehicle
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3 lg:mt-20">
          {SELL_POINTS.map((point, index) => {
            const Icon = point.icon;
            const isActive = active === index;

            return (
              <Link
                key={point.number}
                href="/sell"
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className="group relative min-h-[30rem] overflow-hidden border border-white/10 bg-[#0f0c09] outline-none sm:min-h-[34rem] lg:min-h-[40rem]"
              >
                <Image
                  src={point.image}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center transition-transform duration-[1400ms] ease-out group-hover:scale-[1.07] group-focus-visible:scale-[1.07]"
                />

                <div
                  className="absolute inset-0"
                  aria-hidden="true"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(8,6,4,0.16) 0%, rgba(8,6,4,0.04) 32%, rgba(8,6,4,0.95) 100%)',
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
                  <p className="mb-3 font-data text-[0.56rem] uppercase tracking-[0.18em] text-white/55">
                    Sell on Voltaris
                  </p>

                  <h3 className="max-w-xl font-display text-5xl leading-[0.86] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                    {point.title}
                  </h3>

                  <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-white/70 sm:text-base">
                    {point.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4">
                    <span className="font-data text-[0.56rem] uppercase tracking-[0.16em] text-white/55">
                      {point.number} / 03
                    </span>

                    <span className="inline-flex items-center gap-2 font-data text-[0.58rem] uppercase tracking-[0.16em] text-white transition-colors group-hover:text-[color:var(--vds-brand-secondary)]">
                      Start a listing
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
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
