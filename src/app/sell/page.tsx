import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Sell your electric or hybrid car in Rwanda',
  description:
    'List your electric or hybrid vehicle with Voltaris and reach buyers across Rwanda.',
  path: '/sell',
});

const gallery = Array.from({ length: 8 }, (_, index) => ({
  src: `/hero/gallery/car${index + 1}.jpeg`,
  alt: `Vehicle available through Voltaris`,
}));

export default function SellPage() {
  return (
    <main className="bg-surface text-chrome">
      {/* CINEMATIC SELL HERO */}
      <section className="relative min-h-[100svh] overflow-hidden bg-black">
        {/* Car image gallery background */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
        >
          {gallery.map((image, index) => (
            <Image
              key={image.src}
              src={image.src}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className={`sell-bg-frame sell-bg-frame-${index + 1} object-cover`}
            />
          ))}

          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/45" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1600px] flex-col px-5 pb-8 pt-28 sm:px-8 sm:pb-12 lg:px-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-data text-[10px] uppercase tracking-[0.24em] text-white/60">
                Voltaris / Sell
              </p>
              <p className="mt-2 font-data text-[9px] uppercase tracking-[0.18em] text-white/40">
                Private owners welcome
              </p>
            </div>

            <Link
              href="/cars"
              className="hidden items-center gap-2 border border-white/20 bg-black/20 px-4 py-2 font-data text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur-md transition hover:bg-white hover:text-black sm:flex"
            >
              Browse cars
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid flex-1 items-end gap-10 pb-4 pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            {/* Editorial copy */}
            <div className="max-w-2xl text-white">
              <p className="mb-5 flex items-center gap-3 font-data text-[10px] uppercase tracking-[0.2em] text-volt">
                <span className="h-px w-8 bg-volt" />
                Sell with confidence
              </p>

              <h1 className="max-w-xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.045em] sm:text-6xl lg:text-8xl">
                Your car.
                <br />
                Your terms.
                <br />
                <span className="text-white/55">A better sale.</span>
              </h1>

              <p className="mt-7 max-w-lg text-sm leading-7 text-white/70 sm:text-base">
                List your electric or hybrid vehicle directly with Voltaris.
                You do not need to be a dealer. Private owners can list too.
              </p>

              <div className="mt-8 flex flex-col items-start gap-4">
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-4 bg-white px-6 py-4 font-data text-[10px] uppercase tracking-[0.16em] text-black transition hover:bg-volt"
                >
                  Start listing
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <p className="font-data text-[9px] uppercase tracking-[0.16em] text-white/45">
                  Sign in to create your listing
                </p>
              </div>
            </div>

            {/* Listing access */}
            <div className="flex items-end">
              <div className="w-full max-w-xl border border-white/15 bg-black/25 p-6 shadow-2xl backdrop-blur-md sm:p-8 lg:p-10">
                <p className="font-data text-[9px] uppercase tracking-[0.2em] text-white/45">
                  Sell through Voltaris
                </p>

                <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                  Ready to put your car on the market?
                </h2>

                <p className="mt-4 max-w-lg text-sm leading-6 text-white/60">
                  Sign in to your Voltaris account to create a listing.
                  Private owners, dealers and businesses are welcome.
                </p>

                <Link
                  href="/login"
                  className="group mt-7 inline-flex items-center gap-3 border border-white/25 bg-white px-5 py-3.5 font-data text-[10px] uppercase tracking-[0.16em] text-black transition hover:bg-volt"
                >
                  Sign in to list your car
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-b border-hairline bg-surface">
        <div className="mx-auto grid max-w-[1500px] md:grid-cols-3">
          <div className="border-b border-hairline px-6 py-10 md:border-b-0 md:border-r">
            <Sparkles className="mb-5 h-5 w-5 text-volt" />
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-steel-muted">
              01 / Presentation
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold">
              Make the car stand out.
            </h3>
            <p className="mt-3 text-sm leading-6 text-steel">
              Add clear photos and the details buyers actually need.
            </p>
          </div>

          <div className="border-b border-hairline px-6 py-10 md:border-b-0 md:border-r">
            <Users className="mb-5 h-5 w-5 text-volt" />
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-steel-muted">
              02 / Everyone
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold">
              Private owners welcome.
            </h3>
            <p className="mt-3 text-sm leading-6 text-steel">
              You do not need a dealership to list your vehicle.
            </p>
          </div>

          <div className="px-6 py-10">
            <ShieldCheck className="mb-5 h-5 w-5 text-volt" />
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-steel-muted">
              03 / Review
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold">
              Reviewed before publication.
            </h3>
            <p className="mt-3 text-sm leading-6 text-steel">
              Voltaris reviews submitted listings before they go live.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-surface-inverse px-5 py-24 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-12 lg:flex-row lg:items-end">
          <div>
            <p className="font-data text-[10px] uppercase tracking-[0.2em] text-white/40">
              Voltaris / Marketplace
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              When you are ready,
              <br />
              put your car in the room.
            </h2>
          </div>

          <Link
            href="/login"
            className="inline-flex w-fit items-center gap-3 border border-white/20 px-6 py-4 font-data text-[10px] uppercase tracking-[0.16em] transition hover:bg-white hover:text-black"
          >
            Start listing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
