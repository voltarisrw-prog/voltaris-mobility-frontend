import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyState';
import { JsonLd } from '@/components/JsonLd';
import { VehicleCard } from '@/components/VehicleCard';
import { VerificationBadge } from '@/components/VerificationBadge';
import { ApiError } from '@/lib/api/errors';
import { getDealer, getDealerVehicles } from '@/lib/api/dealers';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import type { VehicleSummary } from '@/types/vehicle';

type Params = Promise<{ slug: string }>;

async function load(slug: string) {
  try {
    return await getDealer(slug);
  } catch (cause) {
    if (cause instanceof ApiError && cause.isNotFound) notFound();
    throw cause;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const dealer = await load(slug);
  return buildMetadata({
    title: `${dealer.name} — electric vehicles in ${dealer.city}`,
    description: `${dealer.name} lists ${dealer.vehicle_count} electric vehicles on Voltaris. ${dealer.description.slice(0, 160)}`,
    path: `/dealers/${dealer.slug}`,
  });
}

export default async function DealerPage({ params }: { params: Params }) {
  const { slug } = await params;
  const dealer = await load(slug);

  let vehicles: VehicleSummary[] = [];
  try {
    vehicles = (await getDealerVehicles(slug)).items;
  } catch {
    // Inventory failing should not take down the profile.
  }

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Dealers', path: '/dealers' },
    { name: dealer.name, path: `/dealers/${dealer.slug}` },
  ];

  return (
    <div className="shell py-10">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'AutoDealer',
          name: dealer.name,
          url: absoluteUrl(`/dealers/${dealer.slug}`),
          address: {
            '@type': 'PostalAddress',
            streetAddress: dealer.address,
            addressLocality: dealer.city,
            addressCountry: 'RW',
          },
          ...(dealer.phone ? { telephone: dealer.phone } : {}),
        }}
      />
      <Breadcrumbs trail={trail} />

      <header className="mt-6 flex flex-wrap items-start gap-6">
        {dealer.logo_url && (
          <div className="relative h-20 w-20 shrink-0 bg-slab">
            <Image src={dealer.logo_url} alt="" fill sizes="80px" className="object-contain" />
          </div>
        )}
        <div>
          <h1 className="font-display text-headline">{dealer.name}</h1>
          <p className="mt-2 font-data text-xs text-steel-muted">
            {dealer.address}
            {dealer.established_year ? ` · Trading since ${dealer.established_year}` : ''}
          </p>
          <div className="mt-3">
            <VerificationBadge verified={dealer.verified} />
          </div>
        </div>
      </header>

      <p className="mt-8 max-w-prose whitespace-pre-line text-sm leading-relaxed text-steel">
        {dealer.description}
      </p>

      <section className="mt-12">
        <h2 className="font-display text-headline">Currently listed</h2>
        <div className="mt-6">
          {vehicles.length === 0 ? (
            <EmptyState
              title="Nothing listed right now"
              body={`${dealer.name} has no live listings on Voltaris at the moment. New stock appears here as soon as it clears review.`}
              action={{ label: 'See all electric vehicles', href: '/cars' }}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle, index) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} priority={index < 3} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
