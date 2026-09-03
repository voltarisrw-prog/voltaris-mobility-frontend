'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

const PATHS = [
  {
    number: '01',
    title: 'Own',
    description: 'Find a vehicle worth keeping.',
    href: '/cars',
    image: '/demo/vehicles/eqs-black.jpg',
  },
  {
    number: '02',
    title: 'Move',
    description: 'Find the right way to get there.',
    href: '/cars',
    image: '/demo/lifestyle/driving-pov-palms.jpg',
  },
  {
    number: '03',
    title: 'Sell',
    description: 'Put your vehicle in front of the right buyer.',
    href: '/sell',
    image: '/demo/lifestyle/dealership-handshake.jpg',
  },
] as const;

export function WayIn() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative isolate overflow-hidden border-b border-hairline bg-surface">
      <div className="shell py-20 sm:py-24 lg:py-32">
        <header className="mb-16 max-w-2xl sm:mb-20 lg:mb-24">
          <h2 className="mt-7 max-w-xl font-display text-[clamp(3rem,7vw,6.5rem)] font-medium uppercase leading-[0.88] tracking-[-0.045em] text-chrome">
            Your drive
            <br />
            Your way
          </h2>
        </header>

        <div className="relative">
          <div
            className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
            aria-hidden="true"
          >
            {PATHS.map((path, index) => (
              <div
                key={path.title}
                className="absolute inset-y-0 right-0 w-[42%] transition-all duration-700 ease-out"
                style={{
                  opacity: active === index ? 0.22 : 0,
                  transform:
                    active === index
                      ? 'translateX(0) scale(1)'
                      : 'translateX(32px) scale(1.04)',
                }}
              >
                <Image
                  src={path.image}
                  alt=""
                  fill
                  sizes="42vw"
                  className="object-cover object-center"
                />
              </div>
            ))}
          </div>

          <div className="relative">
            {PATHS.map((path, index) => {
              const isActive = active === index;

              return (
                <Link
                  key={path.title}
                  href={path.href}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  className="group relative block border-t border-hairline py-8 outline-none transition-colors duration-500 last:border-b sm:py-10 lg:py-12"
                >
                  <div className="relative z-10 flex items-center gap-5 sm:gap-8 lg:gap-12">
                    <span className="w-8 shrink-0 self-start pt-2 font-data text-[0.58rem] tracking-[0.16em] text-steel-muted transition-colors duration-500 group-hover:text-volt group-focus-visible:text-volt sm:w-10">
                      {path.number}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3
                        className={[
                          'font-display text-[clamp(3.4rem,9vw,8.5rem)] font-medium uppercase leading-[0.78] tracking-[-0.05em] transition-all duration-500',
                          isActive
                            ? 'translate-x-2 text-chrome lg:translate-x-5'
                            : 'text-chrome/65 group-hover:translate-x-2 group-hover:text-chrome group-focus-visible:translate-x-2 group-focus-visible:text-chrome',
                        ].join(' ')}
                      >
                        {path.title}
                      </h3>

                      <p
                        className={[
                          'mt-4 max-w-sm font-data text-[0.62rem] uppercase leading-[1.5] tracking-[0.16em] transition-all duration-500 sm:mt-5 sm:text-[0.68rem]',
                          isActive
                            ? 'translate-x-2 text-chrome/70 lg:translate-x-5'
                            : 'text-steel-muted group-hover:text-chrome/70 group-focus-visible:text-chrome/70',
                        ].join(' ')}
                      >
                        {path.description}
                      </p>
                    </div>

                    <span
                      className={[
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all duration-500 sm:h-14 sm:w-14',
                        isActive
                          ? 'border-volt bg-volt text-surface'
                          : 'border-hairline text-chrome group-hover:border-chrome group-hover:text-chrome group-focus-visible:border-chrome group-focus-visible:text-chrome',
                      ].join(' ')}
                    >
                      <ArrowUpRight
                        className={[
                          'h-4 w-4 transition-transform duration-500 sm:h-5 sm:w-5',
                          isActive ? 'rotate-0' : '-rotate-45 group-hover:rotate-0 group-focus-visible:rotate-0',
                        ].join(' ')}
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
