import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { about } from '@/content/legal';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'About Voltaris Mobility',
  description:
    'Voltaris is a vehicle marketplace built in Kigali, for Rwanda. We connect buyers with dealers and owners, and check the paperwork before a listing goes live.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="shell py-6 sm:py-8">
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]} />

      <section className="relative mt-6 overflow-hidden rounded-[2.5rem] bg-black text-white">
        <div className="relative min-h-[78svh] sm:min-h-[82svh]">
          <Image
            src="/demo/lifestyle/ev-lineup.jpg"
            alt="Voltaris electric vehicle lineup"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-6 sm:p-8 lg:p-10">
            <div className="rounded-2xl bg-white px-4 py-3 sm:px-5 sm:py-4">
              <Image
                src="/brand/voltaris-logo-full.jpeg"
                alt="Voltaris Mobility"
                width={220}
                height={72}
                className="h-auto w-[150px] sm:w-[190px]"
              />
            </div>

            <span className="font-data text-[9px] uppercase tracking-[0.2em] text-white/75">
              Born in Kigali
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-12">
            <div className="max-w-5xl">
              <p className="font-data text-[10px] uppercase tracking-[0.22em] text-volt">
                About Voltaris
              </p>

              <h1 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[0.92] tracking-[-0.045em] sm:text-6xl lg:text-8xl">
                {about.lead}
              </h1>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/cars"
                  className="group inline-flex items-center gap-4 rounded-full bg-white px-6 py-4 font-data text-[10px] uppercase tracking-[0.16em] text-black transition hover:bg-volt"
                >
                  Explore vehicles
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-full border border-white/35 px-6 py-4 font-data text-[10px] uppercase tracking-[0.16em] text-white transition hover:border-white hover:bg-white hover:text-black"
                >
                  Talk to us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-[2.5rem] bg-black text-white">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className="relative min-h-[430px] sm:min-h-[520px] lg:min-h-[620px]">
            <Image
              src="/demo/lifestyle/driving-pov-palms.jpg"
              alt="Driving through Rwanda"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-center"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <span className="absolute bottom-6 left-6 font-data text-[9px] uppercase tracking-[0.2em] text-white/70 sm:bottom-8 sm:left-8">
              The Voltaris perspective
            </span>
          </div>

          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <p className="font-data text-[10px] uppercase tracking-[0.22em] text-volt">
              Why we exist
            </p>

            <h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Built for the way Rwanda moves.
            </h2>

            <div className="mt-8 max-w-lg space-y-5">
              {about.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="text-sm leading-7 text-white/70 sm:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {about.values.map((value, index) => (
            <div
              key={value.title}
              className="group flex min-h-[250px] flex-col justify-between rounded-[2rem] bg-white p-6 text-black shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7"
            >
              <div className="flex items-start justify-between gap-6">
                <span className="font-data text-[10px] uppercase tracking-[0.18em] text-volt">
                  0{index + 1}
                </span>

                <span className="h-2.5 w-2.5 rounded-full bg-volt transition-transform duration-300 group-hover:scale-125" />
              </div>

              <div className="mt-10">
                <dt className="font-display text-xl font-semibold tracking-[-0.02em]">
                  {value.title}
                </dt>

                <dd className="mt-3 text-sm leading-7 text-steel">
                  {value.body}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>

      <section className="mt-8">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
          <div className="relative min-h-[420px] overflow-hidden rounded-[2.5rem] bg-black sm:min-h-[560px]">
            <Image
              src="/demo/lifestyle/villa-sunset-charging.jpg"
              alt="Electric mobility at home"
              fill
              sizes="(min-width: 1024px) 67vw, 100vw"
              className="object-cover object-center transition duration-700 hover:scale-[1.02]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
              <p className="font-data text-[9px] uppercase tracking-[0.2em] text-white/70">
                Electric by design
              </p>
              <p className="mt-3 max-w-lg font-display text-2xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-3xl">
                Mobility should fit naturally into the life around it.
              </p>
            </div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-[2.5rem] bg-black sm:min-h-[420px] lg:min-h-[560px]">
            <Image
              src="/demo/lifestyle/family-home-charging.jpg"
              alt="Family using electric vehicle charging at home"
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover object-center transition duration-700 hover:scale-[1.02]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

            <span className="absolute bottom-6 left-6 font-data text-[9px] uppercase tracking-[0.2em] text-white/70 sm:bottom-8 sm:left-8">
              Made for everyday movement
            </span>
          </div>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-[2.5rem] bg-black text-white">
        <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:p-14">
          <div>
            <div className="inline-flex rounded-2xl bg-white px-4 py-3">
              <Image
                src="/brand/voltaris-logo-full.jpeg"
                alt="Voltaris Mobility"
                width={220}
                height={72}
                className="h-auto w-[150px] sm:w-[180px]"
              />
            </div>

            <p className="mt-10 max-w-xl font-display text-4xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Move differently.
            </p>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
              Discover a simpler way to buy, rent, and sell vehicles in Rwanda.
            </p>
          </div>

          <div className="flex flex-col justify-end">
            <div className="border-t border-white/15">
              <Link
                href="/cars"
                className="group flex items-center justify-between border-b border-white/15 py-5 transition-colors hover:text-volt"
              >
                <span className="font-display text-2xl font-semibold tracking-tight">
                  Buy a vehicle
                </span>
                <span className="text-xl transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </Link>

              <Link
                href="/cars?mode=rental"
                className="group flex items-center justify-between border-b border-white/15 py-5 transition-colors hover:text-volt"
              >
                <span className="font-display text-2xl font-semibold tracking-tight">
                  Rent a vehicle
                </span>
                <span className="text-xl transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </Link>

              <Link
                href="/sell"
                className="group flex items-center justify-between border-b border-white/15 py-5 transition-colors hover:text-volt"
              >
                <span className="font-display text-2xl font-semibold tracking-tight">
                  Sell your vehicle
                </span>
                <span className="text-xl transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
