import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FormShell } from '@/features/forms/FormShell';
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
    <FormShell
      breadcrumb={
        <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]} />
      }
      title="Talk to us"
      intro="A person reads every message and replies within a working day. You do not need to have picked a vehicle first — most people who write to us have not."
      tagline="A real person replies."
      taglineBody="Tell us what you need and the Voltaris team will get back to you."
      chips={['Buying', 'Selling', 'Partnering']}
    >
      <HomeInquiryForm />

      <dl className="fs-details">
        <div>
          <dt>Email</dt>
          <dd><a href={`mailto:${company.email}`}>{company.email}</a></dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>{company.phone}</dd>
        </div>
        <div>
          <dt>Where we are</dt>
          <dd>{company.address}</dd>
        </div>
        <div>
          <dt>Data and privacy</dt>
          <dd><a href={`mailto:${company.privacyEmail}`}>{company.privacyEmail}</a></dd>
        </div>
      </dl>
    </FormShell>
  );
}
