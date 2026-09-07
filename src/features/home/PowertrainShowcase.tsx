import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MOCK_VEHICLES } from '@/lib/mock/fixtures';

const availableStock = MOCK_VEHICLES.filter(
  (vehicle) =>
    vehicle.status === 'available' &&
    vehicle.primary_image?.card,
);

function vehicleText(vehicle: (typeof MOCK_VEHICLES)[number]) {
  return `${vehicle.make} ${vehicle.model} ${vehicle.variant ?? ''}`.toLowerCase();
}

function isHybrid(vehicle: (typeof MOCK_VEHICLES)[number]) {
  return /hybrid|recharge|\\b500h\\b|\\b450h\\b|\\b300h\\b/.test(
    vehicleText(vehicle),
  );
}

function requireVehicle(
  vehicle: (typeof MOCK_VEHICLES)[number] | undefined,
  powertrain: 'electric' | 'hybrid',
) {
  if (!vehicle) {
    throw new Error(
      `PowertrainShowcase requires available ${powertrain} stock`,
    );
  }

  return vehicle;
}

const hybridVehicle = requireVehicle(
  availableStock.find((vehicle) => isHybrid(vehicle)),
  'hybrid',
);

const electricVehicle = requireVehicle(
  availableStock.find(
    (vehicle) =>
      !isHybrid(vehicle) &&
      vehicle.purchase_enabled === true &&
      vehicle.rental_enabled === true,
  ) ?? availableStock.find((vehicle) => !isHybrid(vehicle)),
  'electric',
);

const electric = {
  make: electricVehicle.make,
  model: `${electricVehicle.model}${electricVehicle.variant ? ` ${electricVehicle.variant}` : ''}`,
  image: electricVehicle.primary_image!.card,
  href: '/cars?fuel=electric',
};

const hybrid = {
  make: hybridVehicle.make,
  model: `${hybridVehicle.model}${hybridVehicle.variant ? ` ${hybridVehicle.variant}` : ''}`,
  image: hybridVehicle.primary_image!.card,
  href: '/cars?fuel=hybrid',
};

export function PowertrainShowcase() {
  const electric = {
    make: electricVehicle.make,
    model: `${electricVehicle.model}${electricVehicle.variant ? ` ${electricVehicle.variant}` : ''}`,
    image: electricVehicle.primary_image!.card,
    href: '/cars?fuel=electric',
  };

  const hybrid = {
    make: hybridVehicle.make,
    model: `${hybridVehicle.model}${hybridVehicle.variant ? ` ${hybridVehicle.variant}` : ''}`,
    image: hybridVehicle.primary_image!.card,
    href: '/cars?fuel=hybrid',
  };

  return (
    <section className="border-y border-[color:var(--vds-border)] bg-[#0c0906]">
      <div className="shell py-16 sm:py-20 lg:py-28">
        <div className="mb-10 max-w-3xl sm:mb-14 lg:mb-16">
          <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
            Find your fit
          </p>

          <h2 className="mt-4 max-w-3xl font-display text-5xl leading-[0.88] tracking-[-0.045em] sm:text-6xl lg:text-8xl">
            Choose your powertrain
          </h2>

          <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-[color:var(--vds-text-muted)] sm:text-lg">
            Two ways to move, one place to find the vehicle that fits your life
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {[
            {
              type: 'Fully electric',
              title: 'Electric',
              vehicle: electric,
              glow: 'rgba(92,200,255,0.18)',
              number: '01',
            },
            {
              type: 'Electric + fuel',
              title: 'Hybrid',
              vehicle: hybrid,
              glow: 'rgba(174,255,96,0.12)',
              number: '02',
            },
          ].map(({ type, title, vehicle, glow, number }) => (
            <Link
              key={title}
              href={vehicle.href}
              className="group relative min-h-[30rem] overflow-hidden border border-white/10 bg-[#15110d] sm:min-h-[38rem] lg:min-h-[46rem]"
            >
              <Image
                src={vehicle.image}
                alt={`${vehicle.make} ${vehicle.model}`}
                fill
                priority={number === '01'}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-[1400ms] ease-out group-hover:scale-[1.07]"
              />

              <div
                className="absolute inset-0 opacity-80 mix-blend-screen transition-opacity duration-1000 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at 50% 38%, ${glow}, transparent 58%)`,
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-[#080604]/95" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />

              {/* Top information */}
              <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-5 sm:p-7">
                <span className="font-data text-[0.58rem] uppercase tracking-[0.2em] text-white/70">
                  {number} / 02
                </span>

                <span className="border border-white/20 bg-black/20 px-3 py-1.5 font-data text-[0.55rem] uppercase tracking-[0.16em] text-white backdrop-blur-md">
                  {type}
                </span>
              </div>

              {/* Bottom editorial content */}
              <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:p-10">
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <p className="font-data text-[0.58rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
                      {vehicle.make}
                    </p>

                    <h3 className="mt-3 font-display text-5xl leading-[0.82] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
                      {title}
                    </h3>

                    <p className="mt-4 max-w-sm font-display text-lg leading-tight text-white/75 sm:text-xl">
                      {vehicle.model}
                    </p>
                  </div>

                  <span className="mb-1 hidden h-12 w-12 shrink-0 items-center justify-center border border-white/25 text-white transition-all duration-500 group-hover:border-[color:var(--vds-brand-secondary)] group-hover:bg-[color:var(--vds-brand-secondary)] group-hover:text-[#0c0906] sm:flex">
                    <ArrowRight
                      className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>

                <div className="mt-7 flex items-center justify-between border-t border-white/15 pt-5">
                  <span className="font-data text-[0.6rem] uppercase tracking-[0.17em] text-white/65">
                    Discover your next drive
                  </span>

                  <span className="inline-flex items-center gap-2 font-data text-[0.6rem] uppercase tracking-[0.17em] text-white transition-colors group-hover:text-[color:var(--vds-brand-secondary)]">
                    Explore {title.toLowerCase()}
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
