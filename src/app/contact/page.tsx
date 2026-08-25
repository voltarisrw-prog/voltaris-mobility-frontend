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

          <dl className="mt-10 space-y-6">
            <div className="border-t border-hairline pt-4">
              <dt className="eyebrow">Email</dt>
              <dd className="mt-2 text-sm">
                <a href={`mailto:${company.email}`} className="text-volt hover:underline">
                  {company.email}
                </a>
              </dd>
            </div>
            <div className="border-t border-hairline pt-4">
              <dt className="eyebrow">Phone</dt>
              <dd className="mt-2 text-sm text-steel">{company.phone}</dd>
            </div>
            <div className="border-t border-hairline pt-4">
              <dt className="eyebrow">Where we are</dt>
              <dd className="mt-2 text-sm text-steel">{company.address}</dd>
            </div>
            <div className="border-t border-hairline pt-4">
              <dt className="eyebrow">Data and privacy</dt>
              <dd className="mt-2 text-sm">
                <a href={`mailto:${company.privacyEmail}`} className="text-volt hover:underline">
                  {company.privacyEmail}
                </a>
              </dd>
            </div>
          </dl>
        </header>

        <div className="border border-hairline p-6 sm:p-8">
          <HomeInquiryForm />
        </div>
      </div>
    </div>
  );
}
