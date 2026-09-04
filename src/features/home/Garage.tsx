'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

const STORIES = [
  {
    title: 'Mercedes-Benz EQS',
    kicker: 'The quiet arrival',
    description: 'Executive electric travel with presence, space, and restraint.',
    href: '/cars',
    image: '/demo/vehicles/eqs-black.jpg',
    featured: true,
  },
  {
    title: 'Porsche Taycan',
    kicker: 'Electric, without the noise',
    description: 'A sharper interpretation of electric performance.',
    href: '/cars',
    image: '/demo/vehicles/taycan-white.jpg',
    featured: false,
  },
  {
    title: 'Toyota Land Cruiser',
    kicker: 'Built to go further',
    description: 'Capability shaped for roads that do not always stay predictable.',
    href: '/cars',
    image: '/demo/vehicles/landcruiser-black.jpg',
    featured: false,
  },
] as const;

export function Garage() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative isolate overflow-hidden bg-[color:var(--vds-bg)]">
      <div className="shell py-24 sm:py-28 lg:py-36">
        <header className="mb-16 sm:mb-20 lg:mb-24">
          <h2 className="max-w-5xl font-display text-[clamp(4rem,11vw,10rem)] font-medium uppercase leading-[0.78] tracking-[-0.055em] text-[color:var(--vds-text)]">
            The Garage
          </h2>
        </header>

        <div className="space-y-20 sm:space-y-28 lg:space-y-36">
          {STORIES.map((story, index) => {
            const isFeatured = story.featured;

            return (
              <Link
                key={story.title}
                href={story.href}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className={[
                  'group block outline-none',
                  isFeatured ? '' : 'lg:ml-[12%]',
                ].join(' ')}
              >
                <div
                  className={[
                    'relative overflow-hidden',
                    isFeatured
                      ? 'aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/8.5]'
                      : 'aspect-[4/3] max-w-4xl sm:aspect-[16/10] lg:aspect-[16/9]',
                  ].join(' ')}
                >
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    sizes={
                      isFeatured
                        ? '100vw'
                        : '(min-width: 1024px) 75vw, 100vw'
                    }
                    className={[
                      'object-cover transition-transform duration-1000 ease-out',
                      active === index
                        ? 'scale-[1.035]'
                        : 'scale-100 group-hover:scale-[1.035]',
                    ].join(' ')}
                  />

                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#0C0906]/85 via-[#0C0906]/15 to-transparent"
                    aria-hidden="true"
                  />

                  <span className="absolute right-5 top-5 font-data text-[0.58rem] uppercase tracking-[0.18em] text-[color:var(--vds-text-secondary)] sm:right-7 sm:top-7">
                    0{index + 1}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 sm:p-8 lg:p-10">
                    <div className="max-w-3xl">
                      <p className="mb-3 font-data text-[0.58rem] uppercase tracking-[0.18em] text-[color:var(--vds-text)]/60 sm:text-[0.64rem]">
                        {story.kicker}
                      </p>

                      <h3 className="font-display text-[clamp(2.5rem,7vw,7rem)] font-medium uppercase leading-[0.8] tracking-[-0.045em] text-[color:var(--vds-text)] transition-transform duration-700 group-hover:translate-x-2 group-focus-visible:translate-x-2">
                        {story.title}
                      </h3>

                      <p className="mt-5 max-w-md font-data text-[0.62rem] uppercase leading-[1.55] tracking-[0.14em] text-[color:var(--vds-text-secondary)] sm:text-[0.68rem]">
                        {story.description}
                      </p>
                    </div>

                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--vds-border)] text-[color:var(--vds-text)] transition-all duration-500 group-hover:border-volt group-hover:bg-volt group-hover:text-surface group-focus-visible:border-volt group-focus-visible:bg-volt group-focus-visible:text-surface sm:h-14 sm:w-14">
                      <ArrowUpRight
                        className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-5 sm:w-5"
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
