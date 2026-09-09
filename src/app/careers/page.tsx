import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { jobPostings } from '@/content/careers';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Careers',
  description:
    'Join Voltaris Mobility and help build the future of vehicle commerce and electric mobility in Rwanda.',
  path: '/careers',
});

export default function CareersPage() {
  return (
    <div className="shell py-10">
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Careers', path: '/careers' }]} />

      <header className="relative mt-6 overflow-hidden rounded-[2.5rem] bg-black text-white lg:mt-8">
        <div className="absolute inset-0">
          <Image
            src="/demo/lifestyle/dealership-handshake.jpg"
            alt="Voltaris automotive partnership"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
        </div>

        <div className="relative flex min-h-[620px] flex-col justify-between p-7 sm:min-h-[680px] sm:p-10 lg:min-h-[700px] lg:p-14">
          <div className="flex items-start justify-between gap-6">
            <div className="inline-flex rounded-2xl bg-white px-4 py-3">
              <Image
                src="/brand/voltaris-logo-full.jpeg"
                alt="Voltaris Mobility"
                width={220}
                height={72}
                className="h-auto w-[150px] sm:w-[180px]"
              />
            </div>

            <span className="rounded-full border border-white/20 bg-black/20 px-4 py-2 font-data text-[9px] uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm">
              {jobPostings.length} open roles
            </span>
          </div>

          <div className="max-w-5xl">
            <p className="font-data text-[10px] uppercase tracking-[0.22em] text-volt">
              Careers at Voltaris
            </p>

            <h1 className="mt-5 max-w-5xl font-display text-5xl font-semibold leading-[0.9] tracking-[-0.05em] sm:text-7xl lg:text-[6.5rem]">
              Build the future
              <br />
              of movement.
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              We are building a better way to buy, sell, rent and understand
              vehicles in Rwanda. If you want to work on something real, come
              build it with us.
            </p>
          </div>
        </div>
      </header>

      <section className="mt-8 sm:mt-10">
        <div className="flex flex-col gap-5 border-b border-black/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-data text-[9px] uppercase tracking-[0.2em] text-volt">
              01 / Open positions
            </p>

            <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[0.95] tracking-[-0.04em] text-black sm:text-5xl">
              Find your place here.
            </h2>
          </div>

          <p className="max-w-xs text-sm leading-6 text-black/55 sm:text-right">
            Small team. Real problems. Work that changes how Rwanda moves.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {jobPostings.map((job, index) => (
            <Link
              key={job.slug}
              href={`/careers/${job.slug}`}
              className="group relative overflow-hidden rounded-[2rem] bg-white p-7 text-black shadow-[0_18px_50px_rgba(0,0,0,0.10)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(0,0,0,0.16)] sm:p-8"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
                    {job.department}
                  </span>

                  <span className="h-1 w-1 rounded-full bg-black/20" />

                  <span className="font-data text-[9px] uppercase tracking-[0.16em] text-black/40">
                    {job.type}
                  </span>
                </div>

                <span className="font-display text-5xl font-semibold leading-none tracking-[-0.06em] text-black/[0.06] transition-colors duration-500 group-hover:text-volt/20">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="mt-14 max-w-2xl">
                <h3 className="font-display text-3xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-4xl">
                  {job.title}
                </h3>

                <p className="mt-4 max-w-xl text-sm leading-7 text-black/60">
                  {job.summary}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  <span className="inline-flex items-center gap-2 font-data text-[9px] uppercase tracking-[0.14em] text-black/45">
                    <MapPin className="h-3.5 w-3.5 text-volt" />
                    {job.location}
                  </span>

                  <span className="font-data text-[9px] uppercase tracking-[0.14em] text-black/45">
                    {job.level}
                  </span>
                </div>

                <span className="inline-flex items-center gap-2 font-data text-[9px] uppercase tracking-[0.16em] text-black transition-colors group-hover:text-volt">
                  View role
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-volt transition-transform duration-500 group-hover:scale-x-100" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-[2.5rem] bg-black text-white">
        <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:p-14">
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

            <p className="mt-10 font-data text-[10px] uppercase tracking-[0.22em] text-volt">
              02 / Your next move
            </p>

            <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Don't see your role?
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
              We are always interested in exceptional people who want to help
              shape the future of mobility in Rwanda.
            </p>
          </div>

          <div className="flex flex-col justify-end">
            <a
              href="mailto:hello@voltaris.rw?subject=General%20careers%20application"
              className="group flex items-center justify-between border-t border-white/15 py-5 transition-colors hover:text-volt"
            >
              <span className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Introduce yourself
              </span>

              <ArrowUpRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>

            <div className="border-t border-white/10 pt-5">
              <p className="font-data text-[9px] uppercase tracking-[0.16em] text-white/35">
                Send your CV and a short introduction
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
