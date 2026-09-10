import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const powertrains = [
  {
    number: '01',
    type: 'Fully electric',
    title: 'Electric',
    description:
      'Quiet, responsive and designed for everyday electric driving',
    image: '/powertrain/electric.png',
    href: '/cars?fuel=electric',
  },
  {
    number: '02',
    type: 'Electric + fuel',
    title: 'Hybrid',
    description:
      'Flexible power for city driving, longer journeys and everything between',
    image: '/powertrain/hybrid.jpeg',
    href: '/cars?fuel=hybrid',
  },
] as const;

export function PowertrainShowcase() {
  return (
    <section className="border-y border-[color:var(--vds-border)] bg-[#0c0906]">
      <div className="shell py-20 sm:py-24 lg:py-32">
        <div className="mb-14 grid gap-8 lg:mb-20 lg:grid-cols-[1fr_0.65fr] lg:items-end">
          <div>
            <p className="font-data text-[0.62rem] uppercase tracking-[0.22em] text-[color:var(--vds-brand-secondary)]">
              Find your fit
            </p>

            <h2 className="mt-5 max-w-4xl font-display text-5xl leading-[0.86] tracking-[-0.055em] text-white sm:text-7xl lg:text-[7rem]">
              Choose your powertrain
            </h2>
          </div>

          <p className="max-w-md font-sans text-base leading-relaxed text-[color:var(--vds-text-muted)] lg:justify-self-end lg:pb-2 lg:text-lg">
            Two ways to move, one place to find the vehicle that fits your life
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2 md:gap-8 lg:gap-16">
          {powertrains.map(
            ({ number, type, title, description, image, href }) => (
              <Link
                key={title}
                href={href}
                className="group flex flex-col items-center text-center outline-none"
              >
                <div className="relative aspect-[0.92] w-[min(86vw,34rem)] overflow-hidden rounded-[3rem] border border-white/10 bg-[#15110d] shadow-[0_30px_80px_rgba(0,0,0,0.35)] transition-transform duration-700 ease-out group-hover:scale-[1.025] group-focus-visible:scale-[1.025]">
                  <Image
                    src={image}
                    alt={`${title} vehicle powertrain`}
                    fill
                    sizes="(max-width: 767px) 86vw, (max-width: 1279px) 43vw, 34rem"
                    quality={100}
                    unoptimized
                    className="object-cover object-center transition-transform duration-[1600ms] ease-out group-hover:scale-[1.06] group-focus-visible:scale-[1.06]"
                  />

                  <div
                    className="absolute inset-0 rounded-full bg-gradient-to-b from-black/10 via-transparent to-black/45"
                    aria-hidden="true"
                  />

                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-6 sm:p-8">
                    <span className="font-data text-[0.58rem] uppercase tracking-[0.2em] text-white/65">
                      {number} / 02
                    </span>

                    <span className="border border-white/20 bg-black/15 px-3 py-1.5 font-data text-[0.55rem] uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                      {type}
                    </span>
                  </div>

                  <span className="absolute bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/15 text-white backdrop-blur-md transition-all duration-500 group-hover:border-[color:var(--vds-brand-secondary)] group-hover:bg-[color:var(--vds-brand-secondary)] group-hover:text-[#0c0906] sm:bottom-8 sm:right-8 sm:h-14 sm:w-14">
                    <ArrowRight
                      className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>

                <div className="mt-8 max-w-xl">
                  <p className="font-data text-[0.58rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
                    {type}
                  </p>

                  <h3 className="mt-3 font-display text-5xl leading-[0.86] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
                    {title}
                  </h3>

                  <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed text-white/60 sm:text-base">
                    {description}
                  </p>

                  <span className="mt-6 inline-flex items-center gap-2 font-data text-[0.58rem] uppercase tracking-[0.16em] text-white/75 transition-colors duration-300 group-hover:text-[color:var(--vds-brand-secondary)]">
                    Explore {title}
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
