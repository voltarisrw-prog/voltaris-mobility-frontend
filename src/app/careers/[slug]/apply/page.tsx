import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, MapPin } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JobApplicationForm } from '@/features/careers/JobApplicationForm';
import { jobPostings } from '@/content/careers';
import { buildMetadata } from '@/lib/seo/metadata';

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getJob(slug: string) {
  return jobPostings.find((job) => job.slug === slug);
}

export function generateStaticParams() {
  return jobPostings.map((job) => ({
    slug: job.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = getJob(slug);

  if (!job) {
    return buildMetadata({
      title: 'Apply',
      description: 'Apply for an open role at Voltaris Mobility.',
      path: `/careers/${slug}/apply`,
    });
  }

  return buildMetadata({
    title: `Apply — ${job.title}`,
    description: `Apply for the ${job.title} position at Voltaris Mobility.`,
    path: `/careers/${job.slug}/apply`,
  });
}

export default async function ApplyPage({ params }: PageProps) {
  const { slug } = await params;
  const job = getJob(slug);

  if (!job) {
    notFound();
  }

  return (
    <div className="shell py-10">
      <Breadcrumbs
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Careers', path: '/careers' },
          { name: job.title, path: `/careers/${job.slug}` },
          { name: 'Apply', path: `/careers/${job.slug}/apply` },
        ]}
      />

      <div className="mt-8">
        <Link
          href={`/careers/${job.slug}`}
          className="inline-flex items-center gap-2 font-data text-[9px] uppercase tracking-[0.16em] text-black/45 transition-colors hover:text-volt"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to role
        </Link>
      </div>

      <header className="mt-8 border-b border-hairline pb-10 lg:mt-12 lg:pb-12">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-3xl">
            <p className="font-data text-[9px] uppercase tracking-[0.2em] text-volt">
              Apply / {job.department}
            </p>

            <h1 className="mt-4 font-display text-display tracking-[-0.04em]">
              {job.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3 lg:pb-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 font-data text-[9px] uppercase tracking-[0.14em] text-black/55">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </span>

            <span className="rounded-full border border-black/10 bg-white px-4 py-2 font-data text-[9px] uppercase tracking-[0.14em] text-black/55">
              {job.type}
            </span>
          </div>
        </div>
      </header>

      <main className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)] lg:gap-12">
        <aside className="order-2 lg:order-1 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[2rem] border border-black/10 bg-black/[0.025] p-7 sm:p-8">
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
              You are applying for
            </p>

            <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">
              {job.title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-black/60">
              {job.summary}
            </p>

            <div className="mt-7 space-y-3 border-t border-black/10 pt-5">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-black/45">Department</span>
                <span className="font-medium text-black">{job.department}</span>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-black/45">Level</span>
                <span className="font-medium text-black">{job.level}</span>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-black/45">Location</span>
                <span className="font-medium text-black">{job.location}</span>
              </div>
            </div>

            <Link
              href={`/careers/${job.slug}`}
              className="group mt-7 inline-flex items-center gap-2 font-data text-[9px] uppercase tracking-[0.16em] text-black/45 transition-colors hover:text-volt"
            >
              Review job description
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </aside>

        <div className="order-1 lg:order-2">
          <JobApplicationForm
            jobSlug={job.slug}
            jobTitle={job.title}
          />
        </div>
      </main>
    </div>
  );
}
