import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BriefcaseBusiness, MapPin } from 'lucide-react';
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

      <header className="mt-10 border-b border-hairline pb-10 lg:mt-14 lg:pb-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-4xl">
            <p className="font-data text-[9px] uppercase tracking-[0.2em] text-volt">
              Careers / Voltaris
            </p>

            <h1 className="mt-4 font-display text-display tracking-[-0.04em] text-black">
              Build the future of movement.
            </h1>
          </div>

          <div className="max-w-md lg:pb-1">
            <p className="text-sm leading-6 text-black/65">
              We are building a better way to buy, sell, rent and understand vehicles in Rwanda.
              If you want to work on something real, come build it with us.
            </p>

            <div className="mt-6 flex items-center gap-3 font-data text-[9px] uppercase tracking-[0.18em] text-black/45">
              <BriefcaseBusiness className="h-4 w-4 text-volt" />
              {jobPostings.length} open positions
            </div>
          </div>
        </div>
      </header>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-6 border-b border-hairline pb-5">
          <div>
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
              01 / Open positions
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Find your place here.
            </h2>
          </div>

          <span className="hidden font-data text-[9px] uppercase tracking-[0.18em] text-black/45 sm:block">
            {jobPostings.length} roles
          </span>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {jobPostings.map((job, index) => (
            <article
              key={job.slug}
              className="group relative overflow-hidden rounded-[2rem] border border-black/10 bg-white p-7 text-black shadow-[0_18px_50px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1 hover:border-black/20 sm:p-8"
            >
              <div className="flex items-start justify-between gap-6">
                <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
                  {job.department}
                </p>

                <span className="font-display text-5xl font-semibold leading-none tracking-[-0.06em] text-black/[0.07] transition-colors duration-500 group-hover:text-black/[0.14]">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="mt-12 max-w-xl">
                <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                  {job.title}
                </h3>

                <p className="mt-3 max-w-lg text-sm leading-6 text-black/65">
                  {job.summary}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-black/10 pt-5">
                <span className="inline-flex items-center gap-2 font-data text-[9px] uppercase tracking-[0.14em] text-black/50">
                  <MapPin className="h-3.5 w-3.5 text-volt" />
                  {job.location}
                </span>

                <span className="font-data text-[9px] uppercase tracking-[0.14em] text-black/50">
                  {job.type}
                </span>

                <span className="font-data text-[9px] uppercase tracking-[0.14em] text-black/50">
                  {job.level}
                </span>
              </div>

              <Link
                href={`/careers/${job.slug}`}
                className="mt-8 inline-flex items-center gap-3 border border-black/10 px-5 py-3.5 font-data text-[9px] uppercase tracking-[0.16em] text-black transition-colors hover:border-black hover:bg-black hover:text-white"
              >
                View role
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <div className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-volt transition-transform duration-500 group-hover:scale-x-100" />
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-[2rem] border border-black/10 bg-white p-7 text-black shadow-[0_18px_50px_rgba(0,0,0,0.12)] sm:p-9 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
              02 / Not seeing your role?
            </p>

            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              We are always interested in exceptional people.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-black/65">
              Tell us what you would build, improve or bring to Voltaris. We care more about
              useful work and clear thinking than a perfect CV.
            </p>
          </div>

          <a
            href="mailto:hello@voltaris.rw"
            className="inline-flex w-fit items-center gap-3 border border-black/10 px-5 py-3.5 font-data text-[9px] uppercase tracking-[0.16em] transition-colors hover:border-black hover:bg-black hover:text-white"
          >
            Introduce yourself
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
