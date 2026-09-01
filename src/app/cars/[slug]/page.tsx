import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CompareToggleButton } from '@/components/CompareToggleButton';
import { JsonLd } from '@/components/JsonLd';
import { PriceDisplay } from '@/components/PriceDisplay';
import { RangeMeter } from '@/components/RangeMeter';
import { TrackVehicleView } from '@/components/TrackVehicleView';
import { VehicleCard } from '@/components/VehicleCard';
import { VerificationBadge } from '@/components/VerificationBadge';
import { ApiError } from '@/lib/api/errors';
import { getSimilarVehicles, getVehicleBySlug } from '@/lib/api/vehicles';
import { breadcrumbJsonLd, faqJsonLd, vehicleJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { formatKm, formatKwh } from '@/lib/format';
import { features } from '@/config/features';
import type { VehicleDetail, VehicleSummary } from '@/types/vehicle';

type Params = Promise<{ slug: string }>;

async function loadVehicle(slug: string): Promise<VehicleDetail> {
  try {
    return await getVehicleBySlug(slug);
  } catch (cause) {
    if (cause instanceof ApiError && cause.isNotFound) notFound();
    throw cause;
  }
}

function vehicleTitle(vehicle: VehicleDetail): string {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}`;
}

/**
 * Descriptions are generated from the specification rather than templated, so two
 * listings of the same model in different condition and location do not collide.
 */
function metaDescription(vehicle: VehicleDetail): string {
  const price =
    vehicle.price === null
      ? 'Price on request'
      : new Intl.NumberFormat('en-RW', {
          style: 'currency',
          currency: vehicle.currency,
          maximumFractionDigits: 0,
        }).format(vehicle.price);
  return `${vehicleTitle(vehicle)} in ${vehicle.location.city}. ${vehicle.range_km} km range, ${vehicle.battery_kwh} kWh battery, ${formatKm(vehicle.mileage_km)} on the odometer. ${price}. ${vehicle.verified ? 'Documents verified by Voltaris. ' : ''}Book a test drive or send an enquiry.`.slice(
    0,
    300,
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await loadVehicle(slug);
  const image = vehicle.images[0];

  return buildMetadata({
    title: `${vehicleTitle(vehicle)} for sale in ${vehicle.location.city}`,
    description: metaDescription(vehicle),
    path: `/cars/${vehicle.slug}`,
    // A sold listing keeps its URL and stays crawlable — the page still helps a
    // buyer and links to live alternatives — but it leaves the index.
    noindex: vehicle.status === 'sold' || vehicle.status === 'unavailable',
    ...(image
      ? { image: { url: image.gallery, width: image.width, height: image.height, alt: image.alt } }
      : {}),
  });
}

export default async function VehiclePage({ params }: { params: Params }) {
  const { slug } = await params;
  const vehicle = await loadVehicle(slug);

  let similar: VehicleSummary[] = [];
  try {
    similar = await getSimilarVehicles(vehicle.id);
  } catch {
    // Related listings are supporting content; their absence must not break the page.
  }

  const title = vehicleTitle(vehicle);
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Electric vehicles', path: '/cars' },
    { name: vehicle.make, path: `/brands/${vehicle.make.toLowerCase()}` },
    { name: title, path: `/cars/${vehicle.slug}` },
  ];

  /**
   * Grouped rather than one flat ten-row list — "Range & battery" and "Charging"
   * answer different questions a buyer has, and a flat list made both equally hard
   * to scan for either one. Seats and Odometer don't literally describe physical
   * dimensions; they land in "Dimensions" because it's the closest fit among the
   * four groups this was scoped to. If vehicle.dimensions (length/width/height/boot)
   * ever gets surfaced on this page, that's the natural point to split this into its
   * own group and give Seats/Odometer a better home.
   */
  const specGroups: { label: string; specs: { label: string; value: string }[] }[] = [
    {
      label: 'Range & battery',
      specs: [
        { label: 'Driving range', value: `${vehicle.range_km} km` },
        { label: 'Battery', value: formatKwh(vehicle.battery_kwh) },
      ],
    },
    {
      label: 'Charging',
      specs: [
        { label: 'AC charging', value: `${vehicle.charging.ac_kw} kW` },
        {
          label: 'DC charging',
          value: vehicle.charging.dc_kw ? `${vehicle.charging.dc_kw} kW` : 'Not supported',
        },
        { label: 'Charge port', value: vehicle.charging.port_type },
        {
          label: '10–80% on DC',
          value: vehicle.charging.dc_10_80_minutes ? `${vehicle.charging.dc_10_80_minutes} min` : '—',
        },
      ],
    },
    {
      label: 'Performance',
      specs: [
        { label: 'Power', value: `${vehicle.power_kw} kW` },
        { label: 'Drivetrain', value: vehicle.drivetrain.toUpperCase() },
      ],
    },
    {
      label: 'Dimensions',
      specs: [
        { label: 'Seats', value: String(vehicle.seats) },
        { label: 'Odometer', value: formatKm(vehicle.mileage_km) },
      ],
    },
  ];

  return (
    <div className="shell py-8 sm:py-12">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <JsonLd data={vehicleJsonLd(vehicle)} />
      <JsonLd data={faqJsonLd(vehicle.faqs)} />
      <TrackVehicleView
        vehicleId={vehicle.id}
        make={vehicle.make}
        model={vehicle.model}
        year={vehicle.year}
        price={vehicle.price}
      />

      <Breadcrumbs trail={trail} />

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          <Gallery vehicle={vehicle} title={title} />

          <section className="mt-10">
            <h2 className="eyebrow">About this vehicle</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-steel">
              {vehicle.description}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="eyebrow">Specification</h2>
            {/* Native <details>/<summary> — same collapsible pattern already used for
                FAQs below, rather than a bespoke accordion. Each group defaults open
                (nothing here was hidden before; this only adds the option to collapse
                a group you don't care about, e.g. Charging on a listing you're buying
                for someone who'll only ever charge at home). */}
            <div className="mt-4 divide-y divide-hairline border-t border-hairline">
              {specGroups.map((group) => (
                <details key={group.label} open className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-3 marker:hidden">
                    <span className="font-display text-sm font-semibold tracking-tight text-chrome">
                      {group.label}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className="h-4 w-4 text-steel-muted transition-transform duration-200 group-open:rotate-180"
                    />
                  </summary>
                  <dl className="grid grid-cols-1 pb-3 sm:grid-cols-2">
                    {group.specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex items-baseline justify-between gap-4 border-b border-hairline/60 py-3 sm:odd:pr-8 sm:even:pl-8"
                      >
                        <dt className="text-sm text-steel">{spec.label}</dt>
                        <dd className="font-data text-sm tabular-nums text-chrome">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              ))}
            </div>
          </section>

          {vehicle.features.length > 0 && (
            <section className="mt-10">
              <h2 className="eyebrow">Features</h2>
              <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                {vehicle.features.map((feature) => (
                  <li key={feature} className="border-b border-hairline/60 py-2 text-sm text-steel">
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {vehicle.faqs.length > 0 && (
            <section className="mt-10">
              <h2 className="eyebrow">Questions buyers ask</h2>
              <div className="mt-4 divide-y divide-hairline/60 border-y border-hairline/60">
                {vehicle.faqs.map((faq) => (
                  <details key={faq.question} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 marker:hidden">
                      <span className="font-display text-sm font-semibold tracking-tight">
                        {faq.question}
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-steel-muted transition-transform duration-200 group-open:rotate-180"
                      />
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-steel">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-hairline p-6">
            <p className="eyebrow">
              {vehicle.condition === 'new' ? 'New' : 'Used'} · {vehicle.location.city}
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight">
              {title}
            </h1>

            <div className="mt-5">
              <PriceDisplay
                amount={vehicle.price}
                currency={vehicle.currency}
                perDay={vehicle.rental_price_per_day}
                size="lg"
              />
            </div>

            <div className="mt-5">
              <RangeMeter rangeKm={vehicle.range_km} />
            </div>

            <div className="mt-5">
              <VerificationBadge verified={vehicle.verified} />
            </div>

            {vehicle.status === 'sold' ? (
              <p className="mt-6 border border-hairline bg-slab p-4 text-sm text-steel">
                This vehicle has been sold. Similar listings are below.
              </p>
            ) : (
              <div className="mt-6 space-y-2">
                {vehicle.test_drive_available && (
                  <Link
                    href={`/test-drive?vehicle=${vehicle.id}`}
                    className="block bg-volt px-5 py-3 text-center font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright"
                  >
                    Book a test drive
                  </Link>
                )}
                <Link
                  href={`/cars/${vehicle.slug}/enquire`}
                  className="block border border-chrome px-5 py-3 text-center font-data text-eyebrow uppercase transition-colors hover:bg-chrome hover:text-surface"
                >
                  Ask about this vehicle
                </Link>
                {features.checkout && vehicle.purchase_enabled && (
                  <Link
                    href={`/checkout/start?vehicle=${vehicle.id}`}
                    className="block border border-hairline px-5 py-3 text-center font-data text-eyebrow uppercase text-steel transition-colors hover:border-chrome hover:text-chrome"
                  >
                    Start a purchase
                  </Link>
                )}
              </div>
            )}

            {/* Available regardless of sold status — comparing against a sold listing's
                specs is still useful context, even though it can't be the thing you buy. */}
            <div className="mt-2">
              <CompareToggleButton vehicleId={vehicle.id} variant="button" />
            </div>

            <div className="mt-6 border-t border-hairline/60 pt-5">
              <p className="eyebrow">Listed by</p>
              <p className="mt-2 text-sm font-medium">
                {vehicle.seller.slug ? (
                  <Link
                    href={`/dealers/${vehicle.seller.slug}`}
                    className="hover:text-volt hover:underline"
                  >
                    {vehicle.seller.display_name}
                  </Link>
                ) : (
                  vehicle.seller.display_name
                )}
              </p>
              <p className="mt-1 font-data text-xs text-steel-muted">
                {vehicle.seller.type === 'dealer' ? 'Registered dealer' : 'Private owner'}
              </p>
            </div>

            {vehicle.financing_available && (
              <p className="mt-5 bg-volt-wash p-4 text-sm text-chrome">
                Financing is available on this vehicle through a Voltaris partner bank. Terms are
                confirmed after your enquiry.
              </p>
            )}
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-headline">Similar electric vehicles</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.slice(0, 3).map((item) => (
              <VehicleCard key={item.id} vehicle={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Gallery({ vehicle, title }: { vehicle: VehicleDetail; title: string }) {
  const [lead, ...rest] = vehicle.images;
  if (!lead) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center bg-slab font-data text-eyebrow uppercase text-steel-muted">
        Photos coming soon
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden bg-slab">
        <Image
          src={lead.detail}
          alt={lead.alt || title}
          fill
          sizes="(min-width: 1024px) 62vw, 100vw"
          className="object-cover"
          priority
          {...(lead.blur_data_url
            ? { placeholder: 'blur' as const, blurDataURL: lead.blur_data_url }
            : {})}
        />
      </div>
      {rest.length > 0 && (
        <ul className="mt-2 grid grid-cols-4 gap-2">
          {rest.slice(0, 4).map((image) => (
            <li key={image.thumb} className="relative aspect-[4/3] overflow-hidden bg-slab">
              <Image
                src={image.thumb}
                alt={image.alt || title}
                fill
                sizes="(min-width: 1024px) 15vw, 25vw"
                className="object-cover"
                loading="lazy"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
