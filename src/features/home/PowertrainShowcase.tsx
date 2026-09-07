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
  return /hybrid|recharge|\b500h\b|\b450h\b|\b300h\b/.test(
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

const powertrains = [
  {
    number: '01',
    type: 'Fully electric',
    title: 'Electric',
    description:
      'Quiet, responsive and designed for everyday electric driving',
    vehicle: electricVehicle,
    href: '/cars?fuel=electric',
  },
  {
    number: '02',
    type: 'Electric + fuel',
    title: 'Hybrid',
    description:
      'Flexible power for city driving, longer journeys and everything between',
    vehicle: hybridVehicle,
    href: '/cars?fuel=hybrid',
  },
];

export function PowertrainShowcase() {
  return (
    <section className="border-y border-[color:var(--vds-border)] bg-[#0c0906]">
      <div className="shell py-20 sm:py-24 lg:py-32">
        <div className="mb-12 grid gap-8 lg:mb-16 lg:grid-cols-[1fr_0.65fr] lg:items-end">
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

        <div className="grid gap-px bg-white/10 md:grid-cols-2">
          {powertrains.map(
            ({ number, type, title, description, vehicle, href }) => (
              <Link
                key={title}
                href={href}
                className="group relative isolate min-h-[34rem] overflow-hidden bg-[#15110d] sm:min-h-[42rem] lg:min-h-[50rem]"
              >
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={vehicle.primary_image!.card}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    width={1536}
                    height={1024}
                    className="h-full w-full object-cover object-center transition-transform duration-[1600ms] ease-out group-hover:scale-[1.045]"
                  />
                </div>

                <div className="absolute inset-0 z-[1] bg-black/10" />

                <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/30 via-transparent to-[#080604]" />

                <div className="absolute inset-x-0 bottom-0 z-[3] h-[55%] bg-gradient-to-t from-[#080604] via-[#080604]/65 to-transparent" />

                <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-6 sm:p-8 lg:p-10">
                  <span className="font-data text-[0.58rem] uppercase tracking-[0.2em] text-white/55">
                    {number} / 02
                  </span>

                  <span className="border border-white/20 bg-black/15 px-3 py-1.5 font-data text-[0.55rem] uppercase tracking-[0.18em] text-white/75 backdrop-blur-md">
                    {type}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:p-10">
                  <div className="max-w-2xl">
                    <p className="font-data text-[0.58rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
                      {vehicle.make}
                    </p>

                    <h3 className="mt-3 font-display text-6xl leading-[0.78] tracking-[-0.055em] text-white sm:text-7xl lg:text-[6.5rem]">
                      {title}
                    </h3>

                    <p className="mt-5 max-w-md font-sans text-sm leading-relaxed text-white/65 sm:text-base">
                      {description}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-white/15 pt-5 sm:mt-10">
                    <div>
                      <p className="font-data text-[0.55rem] uppercase tracking-[0.18em] text-white/45">
                        Featured in stock
                      </p>

                      <p className="mt-2 font-display text-lg leading-none text-white/85 sm:text-xl">
                        {vehicle.model}
                      </p>
                    </div>

                    <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-white/25 text-white transition-all duration-500 group-hover:border-[color:var(--vds-brand-secondary)] group-hover:bg-[color:var(--vds-brand-secondary)] group-hover:text-[#0c0906] sm:h-14 sm:w-14">
                      <ArrowRight
                        className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
