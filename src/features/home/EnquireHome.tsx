import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CarFront, KeyRound, Tag } from 'lucide-react';
import { MOCK_VEHICLES } from '@/lib/mock/fixtures';

const fallbackVehicle = MOCK_VEHICLES[0]!;

const buyVehicle =
  MOCK_VEHICLES.find(
    (vehicle) =>
      vehicle.status === 'available' &&
      vehicle.purchase_enabled &&
      vehicle.primary_image,
  ) ?? fallbackVehicle;

const rentVehicle =
  MOCK_VEHICLES.find(
    (vehicle) =>
      vehicle.status === 'available' &&
      vehicle.rental_enabled &&
      vehicle.primary_image,
  ) ?? fallbackVehicle;

const sellVehicle =
  MOCK_VEHICLES.find(
    (vehicle) =>
      vehicle.status === 'available' &&
      vehicle.primary_image,
  ) ?? fallbackVehicle;

const DIRECTIONS = [
  {
    number: '01',
    icon: CarFront,
    title: 'Buy',
    description:
      'Find an electric or hybrid vehicle that fits your life, your budget and the way you move',
    href: '/buy',
    action: 'Find a vehicle',
    image: buyVehicle.primary_image!.card,
    imageAlt: buyVehicle.primary_image!.alt,
    vehicle: `${buyVehicle.make} ${buyVehicle.model}`,
  },
  {
    number: '02',
    icon: KeyRound,
    title: 'Rent',
    description:
      'Choose a vehicle for the journey you have in mind without making a long-term commitment',
    href: '/rent',
    action: 'Find a rental',
    image: rentVehicle.primary_image!.card,
    imageAlt: rentVehicle.primary_image!.alt,
    vehicle: `${rentVehicle.make} ${rentVehicle.model}`,
  },
  {
    number: '03',
    icon: Tag,
    title: 'Sell',
    description:
      'Put your EV or hybrid in front of people who are already looking for their next vehicle',
    href: '/sell',
    action: 'Sell your vehicle',
    image: sellVehicle.primary_image!.card,
    imageAlt: sellVehicle.primary_image!.alt,
    vehicle: `${sellVehicle.make} ${sellVehicle.model}`,
  },
] as const;

export function EnquireHome() {
  return (
    <section
      aria-labelledby="next-move-title"
      className="border-b border-[color:var(--vds-border)] bg-[color:var(--vds-bg)]"
    >
      <div className="shell py-20 sm:py-24 lg:py-32">
        <div className="max-w-5xl">
          <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
            Your next move
          </p>

          <h2
            id="next-move-title"
            className="mt-5 max-w-5xl font-display text-[clamp(4.2rem,11vw,10rem)] leading-[0.78] tracking-[-0.06em]"
          >
            Where are you
            <br />
            going next?
          </h2>

          <p className="mt-7 max-w-xl font-sans text-base leading-relaxed text-[color:var(--vds-text-muted)] sm:text-lg">
            Whether you want to buy, rent or sell, Voltaris gives you one place
            to make your next move
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden border border-[color:var(--vds-border)] bg-[color:var(--vds-border)] md:grid-cols-3 lg:mt-20">
          {DIRECTIONS.map((direction) => {
            const Icon = direction.icon;

            return (
              <Link
                key={direction.title}
                href={direction.href}
                className="group relative flex min-h-[30rem] flex-col justify-between overflow-hidden bg-[#0f0c09] transition-colors duration-500 hover:bg-[#17120e] focus-visible:bg-[#17120e] sm:min-h-[34rem] lg:min-h-[38rem]"
              >
                <Image
                  src={direction.image}
                  alt={direction.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center opacity-65 transition-all duration-[1200ms] ease-out group-hover:scale-[1.06] group-hover:opacity-85"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/20 to-[#080604]/95" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                <div className="relative z-10 flex items-start justify-between gap-4 p-6 sm:p-8 lg:p-9">
                  <span className="font-data text-[0.58rem] tracking-[0.16em] text-white/60">
                    {direction.number}
                  </span>

                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur-md transition-all duration-300 group-hover:border-[color:var(--vds-brand-secondary)] group-hover:bg-[color:var(--vds-brand-secondary)] group-hover:text-[#0c0906]">
                    <Icon
                      className="h-4 w-4"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </span>
                </div>

                <div className="relative z-10 p-6 sm:p-8 lg:p-9">
                  <p className="font-data text-[0.56rem] uppercase tracking-[0.18em] text-[color:var(--vds-brand-secondary)]">
                    {direction.vehicle}
                  </p>

                  <h3 className="mt-3 font-display text-5xl leading-[0.82] tracking-[-0.04em] text-white sm:text-6xl">
                    {direction.title}
                  </h3>

                  <p className="mt-5 max-w-sm font-sans text-sm leading-relaxed text-white/70">
                    {direction.description}
                  </p>

                  <span className="mt-7 inline-flex items-center gap-2 border-b border-white/25 pb-1.5 font-data text-[0.58rem] uppercase tracking-[0.16em] text-white/75 transition-colors group-hover:border-[color:var(--vds-brand-secondary)] group-hover:text-[color:var(--vds-brand-secondary)]">
                    {direction.action}

                    <ArrowUpRight
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>

                <div
                  className="pointer-events-none absolute -bottom-24 -right-16 z-10 h-56 w-56 rounded-full bg-[color:var(--vds-brand-secondary)]/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-[color:var(--vds-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-lg font-data text-[0.58rem] uppercase leading-[1.7] tracking-[0.12em] text-[color:var(--vds-text-muted)]">
            One marketplace for the way you want to move
          </p>

          <Link
            href="/cars"
            className="group inline-flex w-fit items-center gap-2 font-data text-[0.6rem] uppercase tracking-[0.16em] text-[color:var(--vds-text-secondary)] transition-colors hover:text-[color:var(--vds-brand-secondary)]"
          >
            Explore all vehicles
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
