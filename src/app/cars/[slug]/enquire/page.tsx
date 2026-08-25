import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InquiryForm } from '@/features/leads/InquiryForm';
import { ApiError } from '@/lib/api/errors';
import { getVehicleBySlug } from '@/lib/api/vehicles';
import { buildMetadata } from '@/lib/seo/metadata';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return buildMetadata({
    title: 'Ask about this vehicle',
    description: 'Send a question to the seller through Voltaris.',
    path: `/cars/${slug}/enquire`,
    // A form has nothing to offer a search result; the listing itself is the page.
    noindex: true,
  });
}

export default async function EnquirePage({ params }: { params: Params }) {
  const { slug } = await params;
  let vehicle;
  try {
    vehicle = await getVehicleBySlug(slug);
  } catch (cause) {
    if (cause instanceof ApiError && cause.isNotFound) notFound();
    throw cause;
  }

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <div className="shell max-w-2xl py-10">
      <Breadcrumbs
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Electric vehicles', path: '/cars' },
          { name: title, path: `/cars/${vehicle.slug}` },
          { name: 'Enquire', path: `/cars/${vehicle.slug}/enquire` },
        ]}
      />
      <h1 className="mt-6 font-display text-headline">Ask about the {title}</h1>
      <p className="mt-3 text-sm text-steel">
        Your message goes to {vehicle.seller.display_name} through Voltaris. We keep a copy so we
        can follow up if you do not hear back.
      </p>
      <div className="mt-8">
        <InquiryForm vehicleId={vehicle.id} vehicleTitle={title} />
      </div>
    </div>
  );
}
