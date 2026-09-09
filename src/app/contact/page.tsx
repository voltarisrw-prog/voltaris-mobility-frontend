import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { HomeInquiryForm } from '@/features/home/HomeInquiryForm';
import { company } from '@/content/legal';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Contact Voltaris',
  description: 'Talk to the Voltaris team in Kigali about buying, selling, or partnering.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="shell py-10">
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]} />

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
        <header>
          <h1 className="font-display text-display">Talk to us</h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-steel">
            A person reads every message and replies within a working day. You do not need to
            have picked a vehicle first — most people who write to us have not.
          </p>

          <dl className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="border border-hairline bg-slab p-6 shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
              <dt className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
                Email
              </dt>
              <dd className="mt-4 text-sm">
                <a href={`mailto:${company.email}`} className="text-chrome transition-colors hover:text-volt">
                  {company.email}
                </a>
              </dd>
            </div>

            <div className="border border-hairline bg-slab p-6 shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
              <dt className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
                Phone
              </dt>
              <dd className="mt-4 text-sm text-steel">{company.phone}</dd>
            </div>

            <div className="border border-hairline bg-slab p-6 shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
              <dt className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
                Where we are
              </dt>
              <dd className="mt-4 text-sm leading-6 text-steel">{company.address}</dd>
            </div>

            <div className="border border-hairline bg-slab p-6 shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
              <dt className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
                Data and privacy
              </dt>
              <dd className="mt-4 text-sm">
                <a href={`mailto:${company.privacyEmail}`} className="text-chrome transition-colors hover:text-volt">
                  {company.privacyEmail}
                </a>
              </dd>
            </div>
          </dl>
        </header>

        <div className="border border-hairline bg-slab p-6 shadow-[0_24px_70px_rgba(0,0,0,0.5)] sm:p-8 lg:p-10">
          <div className="mb-8 border-b border-hairline pb-5">
            <p className="font-data text-[9px] uppercase tracking-[0.18em] text-volt">
              Send a message
            </p>
            <p className="mt-2 text-sm leading-6 text-steel">
              Tell us what you need and the Voltaris team will get back to you.
            </p>
          </div>

          <HomeInquiryForm />
        </div>
      </div>
    </div>
  );
}
