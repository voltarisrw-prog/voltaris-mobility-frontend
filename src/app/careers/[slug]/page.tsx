import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, Check, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { jobPostings } from '@/content/careers';
import { buildMetadata } from '@/lib/seo/metadata';

type JobPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return jobPostings.map((job) => ({
    slug: job.slug,
  }));
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = jobPostings.find((item) => item.slug === slug);

  if (!job) {
    return buildMetadata({
      title: 'Role not found',
      description: 'This Voltaris role could not be found.',
      path: `/careers/${slug}`,
    });
  }

  return buildMetadata({
    title: `${job.title} — Careers`,
    description: job.summary,
    path: `/careers/${job.slug}`,
  });
}

export default async function JobPage({ params }: JobPageProps) {
  const { slug } = await params;
  const job = jobPostings.find((item) => item.slug === slug);

  if (!job) {
    notFound();
  }

  const relatedJobs = jobPostings
    .filter((item) => item.slug !== job.slug)
    .slice(0, 3);

  return (
    <div className="shell py-10">
      <Breadcrumbs
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Careers', path: '/careers' },
          { name: job.title, path: `/careers/${job.slug}` },
        ]}
      />

      <header className="mt-10 border-b border-hairline pb-10 lg:mt-14 lg:pb-12">
        <Link
          href="/careers"
          className="inline-flex items-center gap-2 font-data text-[9px] uppercase tracking-[0.16em] text-black/45 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All open positions
        </Link>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-4xl">
            <p className="font-data text-[9px] uppercase tracking-[0.2em] text-volt">
              {job.department} / {job.level}
            </p>

            <h1 className="mt-4 font-display text-display tracking-[-0.04em] text-black">
              {job.title}
            </h1>
          </div>

          <p className="max-w-md text-sm leading-6 text-black/65 lg:pb-1">
            {job.summary}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-hairline pt-5">
          <span className="inline-flex items-center gap-2 font-data text-[9px] uppercase tracking-[0.14em] text-black/50">
            <MapPin className="h-3.5 w-3.5 text-volt" />
            {job.location}
          </span>

          <span className="inline-flex items-center gap-2 font-data text-[9px] uppercase tracking-[0.14em] text-black/50">
            <BriefcaseBusiness className="h-3.5 w-3.5 text-volt" />
            {job.type}
          </span>

          <span className="font-data text-[9px] uppercase tracking-[0.14em] text-black/50">
            {job.level}
          </span>
        </div>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <main className="space-y-10">
          <section className="rounded-[2rem] border border-black/10 bg-white p-7 text-black shadow-[0_18px_50px_rgba(0,0,0,0.12)] sm:p-9">
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
              01 / What you will do
            </p>

            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Responsibilities
            </h2>

            <ul className="mt-8 space-y-5">
              {job.responsibilities.map((item) => (
                <li key={item} className="flex gap-4 text-sm leading-6 text-black/65">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-white p-7 text-black shadow-[0_18px_50px_rgba(0,0,0,0.12)] sm:p-9">
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
              02 / What we are looking for
            </p>

            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Requirements
            </h2>

            <ul className="mt-8 space-y-5">
              {job.requirements.map((item) => (
                <li key={item} className="flex gap-4 text-sm leading-6 text-black/65">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-volt" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-white p-7 text-black shadow-[0_18px_50px_rgba(0,0,0,0.12)] sm:p-9">
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
              03 / Bonus points
            </p>

            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Nice to have
            </h2>

            <ul className="mt-8 space-y-5">
              {job.niceToHave.map((item) => (
                <li key={item} className="flex gap-4 text-sm leading-6 text-black/65">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-black/25" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </main>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-[2rem] border border-volt/30 bg-white p-7 text-black shadow-[0_18px_50px_rgba(0,0,0,0.12)] sm:p-8">
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
              Ready to apply?
            </p>

            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight">
              Make your next move.
            </h2>

            <p className="mt-4 text-sm leading-6 text-black/60">
              Tell us what you have built, what you know and why Voltaris is the place you want
              to work.
            </p>

            <Link
              href={`/careers/${job.slug}/apply`}
              className="group mt-7 flex w-full items-center justify-between bg-black px-5 py-4 font-data text-[9px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-volt hover:text-black"
            >
              Apply for this role
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>

            <p className="mt-4 text-center font-data text-[8px] uppercase tracking-[0.14em] text-black/35">
              Applications reviewed by the Voltaris team
            </p>
          </div>
        </aside>
      </div>

      <section className="mt-16 border-t border-hairline pt-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
              More opportunities
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Other open roles.
            </h2>
          </div>

          <Link
            href="/careers"
            className="hidden items-center gap-2 font-data text-[9px] uppercase tracking-[0.16em] text-black/45 transition-colors hover:text-black sm:inline-flex"
          >
            View all
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {relatedJobs.map((relatedJob) => (
            <Link
              key={relatedJob.slug}
              href={`/careers/${relatedJob.slug}`}
              className="group rounded-[2rem] border border-black/10 bg-white p-6 text-black shadow-[0_18px_50px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1 hover:border-black/20"
            >
              <p className="font-data text-[9px] uppercase tracking-[0.16em] text-volt">
                {relatedJob.department}
              </p>

              <h3 className="mt-10 font-display text-xl font-semibold leading-tight tracking-tight">
                {relatedJob.title}
              </h3>

              <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4">
                <span className="font-data text-[8px] uppercase tracking-[0.14em] text-black/40">
                  {relatedJob.location}
                </span>

                <ArrowUpRight className="h-4 w-4 text-black/35 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
