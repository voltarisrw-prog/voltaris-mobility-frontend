import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const ELECTRIC = [
  {
    make: 'Tesla',
    model: 'Model S Plaid',
    image: '/demo/vehicles/model-s-black.jpg',
    href: '/cars?fuel=electric',
  },
  {
    make: 'Porsche',
    model: 'Taycan 4S',
    image: '/demo/vehicles/taycan-white.jpg',
    href: '/cars?fuel=electric',
  },
  {
    make: 'Mercedes-Benz',
    model: 'EQS 580',
    image: '/demo/vehicles/eqs-black.jpg',
    href: '/cars?fuel=electric',
  },
  {
    make: 'Mercedes-Benz',
    model: 'EQV 300',
    image: '/demo/vehicles/vclass-black.jpg',
    href: '/cars?fuel=electric',
  },
];

const HYBRID = [
  {
    make: 'Toyota',
    model: 'Land Cruiser V8 Hybrid',
    image: '/demo/vehicles/landcruiser-black.jpg',
    href: '/cars?fuel=hybrid',
  },
  {
    make: 'Toyota',
    model: 'Land Cruiser V8 Hybrid',
    image: '/demo/vehicles/landcruiser-black.jpg',
    href: '/cars?fuel=hybrid',
  },
];

function rotatingItem<T>(items: T[]): T {
  const bucket = Math.floor(Date.now() / (6 * 60 * 60 * 1000));
  return items[bucket % items.length]!;
}

export function PowertrainShowcase() {
  const electric = rotatingItem(ELECTRIC);
  const hybrid = rotatingItem(HYBRID);

  return (
    <section className="border-y border-[color:var(--vds-border)] bg-[#0c0906]">
      <div className="shell py-16 sm:py-20 lg:py-28">
        <div className="mb-10 max-w-2xl sm:mb-14">
          <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
            Find your fit
          </p>

          <h2 className="mt-3 text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
            Choose your powertrain
          </h2>

          <p className="mt-5 max-w-xl font-sans text-base leading-relaxed text-[color:var(--vds-text-muted)] sm:text-lg">
            Electric precision or hybrid flexibility, discover a vehicle that fits how you move
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[{ type: 'Fully electric', title: 'Electric', vehicle: electric, glow: 'rgba(92,200,255,0.16)' }, { type: 'Electric + fuel', title: 'Hybrid', vehicle: hybrid, glow: 'rgba(174,255,96,0.11)' }].map(
            ({ type, title, vehicle, glow }) => (
              <Link
                key={title}
                href={vehicle.href}
                className="group relative min-h-[28rem] overflow-hidden border border-[color:var(--vds-border)] bg-[#15110d] sm:min-h-[34rem] lg:min-h-[40rem]"
              >
                <Image
                  src={vehicle.image}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
                />

                <div
                  className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-70"
                  style={{ background: `radial-gradient(circle at 50% 40%, ${glow}, transparent 62%)` }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0906] via-[#0c0906]/55 to-transparent" />

                <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-5 sm:p-7">
                  <span className="font-data text-[0.58rem] uppercase tracking-[0.18em] text-white/70">
                    Changes every 6 hours
                  </span>

                  <span className="border border-white/20 bg-black/20 px-3 py-1.5 font-data text-[0.55rem] uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                    {type}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:p-10">
                  <p className="font-data text-[0.58rem] uppercase tracking-[0.18em] text-[color:var(--vds-brand-secondary)]">
                    {vehicle.make}
                  </p>

                  <h3 className="mt-2 text-4xl leading-none sm:text-5xl lg:text-6xl">
                    {title}
                  </h3>

                  <p className="mt-3 font-display text-lg text-white/80 sm:text-xl">
                    {vehicle.model}
                  </p>

                  <span className="mt-6 inline-flex items-center gap-3 border-b border-white/30 pb-2 font-data text-[0.62rem] uppercase tracking-[0.16em] text-white transition-colors group-hover:border-[color:var(--vds-brand-secondary)] group-hover:text-[color:var(--vds-brand-secondary)]">
                    Explore {title.toLowerCase()}
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
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
