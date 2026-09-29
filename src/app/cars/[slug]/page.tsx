import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { CompareToggleButton } from '@/components/CompareToggleButton';
import { JsonLd } from '@/components/JsonLd';
import { PriceDisplay } from '@/components/PriceDisplay';
import { RangeMeter } from '@/components/RangeMeter';
import { RentalCheckoutPanel } from '@/features/vehicles/RentalCheckoutPanel';
import { VehicleShowcase } from '@/features/vehicles/VehicleShowcase';
import { TrackVehicleView } from '@/components/TrackVehicleView';
import { VehicleCard } from '@/components/VehicleCard';
import { VerificationBadge } from '@/components/VerificationBadge';
import { ApiError } from '@/lib/api/errors';
import { getSimilarVehicles, getVehicleBySlug } from '@/lib/api/vehicles';
import { breadcrumbJsonLd, faqJsonLd, vehicleJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { formatKm, formatKwh } from '@/lib/format';
import { splitImages } from '@/lib/vehicles/imageRoles';
import { heroNumbers } from '@/lib/vehicles/heroNumbers';
import { VehicleSpreads } from '@/features/vehicles/VehicleSpreads';
import { PinnedVehicleCta } from '@/features/vehicles/PinnedVehicleCta';
import { Reveal } from '@/components/motion/Reveal';

import { priceLabelFor } from '@/lib/vehicles/priceLabel';
import { splitDescription } from '@/lib/vehicles/description';
import { features } from '@/config/features';
import type { VehicleDetail, VehicleSummary } from '@/types/vehicle';

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ mode?: string }>;

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

export default async function VehiclePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { mode: requestedMode } = await searchParams;
  const mode = requestedMode === 'rental' ? 'rental' : 'sale';
  const vehicle = await loadVehicle(slug);

  let similar: VehicleSummary[] = [];
  try {
    similar = await getSimilarVehicles(vehicle.id);
  } catch {
    // Related listings are supporting content; their absence must not break the page.
  }

  const title = vehicleTitle(vehicle);
  const spread = splitImages(vehicle.images ?? []);
  const numbers = heroNumbers(vehicle);
  const priceLabel = priceLabelFor(vehicle.price, vehicle.rental_price_per_day, mode);
  const description = splitDescription(vehicle.description ?? '');
  const available = vehicle.status !== 'sold' && vehicle.status !== 'unavailable';
  const demoDriveHref =
    mode === 'sale' && vehicle.test_drive_available ? `/test-drive?vehicle=${vehicle.id}` : null;
  const reserveHref =
    mode === 'sale' && features.checkout && vehicle.purchase_enabled
      ? `/order?vehicle=${encodeURIComponent(vehicle.slug)}`
      : null;
  const whatsappNumber = (vehicle.seller.whatsapp ?? '').replace(/\D/g, '');
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello, I am interested in the ${title} (${vehicle.slug}).`)}`
    : null;
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Electric + hybrid cars', path: '/cars' },
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
    <div className="pb-10 sm:pb-16">
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

      {/* 1 · The showroom: wordmark, photograph, identity strip. */}
      <VehicleShowcase
        images={vehicle.images ?? []}
        title={title}
        make={vehicle.make}
        model={vehicle.model}
        variant={vehicle.variant}
        year={vehicle.year}
        meta={`${mode === 'rental' ? 'Available for rental' : 'Available for purchase'} · ${
          vehicle.condition === 'new' ? 'New' : 'Used'
        } · ${vehicle.location.city}`}
        priceLabel={priceLabel}
        numbers={numbers}
      />

      {/* 2 · One short paragraph, the rest on request. */}
      {description.lead && (
        <div className="shell">
          <Reveal variant="fade" className="max-w-measure pt-block">
            <p className="eyebrow">About this vehicle</p>
            <p className="mt-3 whitespace-pre-line text-lead text-chrome">{description.lead}</p>
            {description.rest && (
              <details className="group mt-3">
                <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 font-data text-eyebrow uppercase tracking-[0.12em] text-steel transition-colors hover:text-chrome marker:hidden">
                  <span className="group-open:hidden">Read more</span>
                  <span className="hidden group-open:inline">Read less</span>
                  <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-steel">{description.rest}</p>
              </details>
            )}
          </Reveal>
        </div>
      )}

      {/* 3 · Cinematic spreads: interior, then details. */}
      <VehicleSpreads interior={spread.interior} detail={spread.detail} />

      <div className="shell mt-block grid gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,0.8fr)] lg:gap-12">
        <div>
          {/* 4 · Specification as four compact groups. */}
          <section aria-labelledby="specification">
            <h2 id="specification" className="eyebrow">Specification</h2>
            <Reveal
              as="div"
              variant="fade"
              stagger={90}
              className="mt-4 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 xl:grid-cols-4"
            >
              {specGroups.map((group) => (
                <div key={group.label} className="bg-surface p-5">
                  <h3 className="font-display text-sm font-semibold tracking-tight text-chrome">{group.label}</h3>
                  <dl className="mt-3 space-y-2.5">
                    {group.specs.map((spec) => (
                      <div key={spec.label} className="flex items-baseline justify-between gap-3">
                        <dt className="text-xs text-steel">{spec.label}</dt>
                        <dd className="font-data text-sm tabular-nums text-chrome">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </Reveal>
          </section>

          {/* 5 · Everything else, one disclosure. */}
          <details id="full-details" className="group mt-10 border-y border-hairline">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between marker:hidden">
              <span className="font-data text-eyebrow uppercase tracking-[0.12em] text-chrome">
                More details
                {vehicle.features.length > 0 ? ` · ${vehicle.features.length} features` : ''}
                {vehicle.faqs.length > 0 ? ` · ${vehicle.faqs.length} questions` : ''}
              </span>
              <ChevronDown aria-hidden="true" className="h-4 w-4 text-steel-muted transition-transform duration-200 group-open:rotate-180" />
            </summary>

            {vehicle.spec_sheet_url && (
              <a
                href={vehicle.spec_sheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="vds-button vds-button-secondary mt-2"
              >
                Download spec sheet (PDF) <span aria-hidden="true">↓</span>
              </a>
            )}

            {vehicle.features.length > 0 && (
              <section className="mt-8">
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
                    <details key={faq.question} className="group/faq py-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 marker:hidden">
                        <span className="font-display text-sm font-semibold tracking-tight">{faq.question}</span>
                        <ChevronDown
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-steel-muted transition-transform duration-200 group-open/faq:rotate-180"
                        />
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-steel">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
            <div className="h-8" />
          </details>
        </div>

        {/* 6 · Actions, sticky beside the content. */}
        <Reveal as="aside" variant="up" delay={120} className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-hairline p-6">
            <p className="eyebrow">Electric + hybrid</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-steel-muted">
              {vehicle.condition === 'new' ? 'New' : 'Used'} · {vehicle.location.city}
            </p>
            <p className="mt-2 font-display text-title font-semibold leading-tight tracking-tight">{title}</p>

            <div className="mt-5">
              <PriceDisplay
                amount={vehicle.price}
                currency={vehicle.currency}
                perDay={vehicle.rental_price_per_day}
                mode={mode}
                size="lg"
              />
            </div>

            <div className="mt-5">
              <RangeMeter rangeKm={vehicle.range_km} />
            </div>

            <div className="mt-5">
              <VerificationBadge verified={vehicle.verified} />
            </div>

            {vehicle.status === 'sold' || vehicle.status === 'unavailable' ? (
              <p className="mt-6 border border-hairline bg-slab p-4 text-sm leading-relaxed text-steel">
                {vehicle.status === 'sold'
                  ? 'This vehicle has been sold. Similar listings are below.'
                  : 'This vehicle is currently unavailable. Similar listings are below.'}
              </p>
            ) : (
              <>
                {mode === 'sale' && reserveHref && (
                  <Link href={reserveHref} className="vds-button vds-button-primary vds-button-lg mt-6 w-full justify-between">
                    <span>Reserve this vehicle</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                )}

                {mode === 'rental' &&
                features.checkout &&
                vehicle.rental_enabled &&
                vehicle.rental_price_per_day ? (
                  <div id="rental-details" className="mt-6">
                    <RentalCheckoutPanel
                      vehicleId={vehicle.id}
                      dailyRate={vehicle.rental_price_per_day}
                      currency={vehicle.currency}
                    />
                  </div>
                ) : null}

                <div className="mt-3 grid gap-2">
                  {demoDriveHref && (
                    <Link href={demoDriveHref} className="vds-button vds-button-secondary w-full">
                      Book a test drive
                    </Link>
                  )}
                  {whatsappHref && (
                    <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="vds-button vds-button-ghost w-full">
                      WhatsApp the seller
                    </a>
                  )}
                  <Link href={`/cars/${vehicle.slug}/enquire`} className="vds-button vds-button-ghost w-full">
                    Ask for more details
                  </Link>
                </div>
              </>
            )}

            {/* Available regardless of sold status — comparing against a sold listing's
                specs is still useful context, even though it can't be the thing you buy. */}
            <div className="mt-2">
              <CompareToggleButton vehicleId={vehicle.id} mode={mode} variant="button" />
            </div>

            <div className="mt-5 grid grid-cols-3 border-y border-hairline/60 py-4">
              <div className="pr-3">
                <p className="eyebrow">Secure</p>
                <p className="mt-1 text-xs text-steel-muted">Protected checkout</p>
              </div>
              <div className="border-l border-hairline/60 px-3">
                <p className="eyebrow">Payment</p>
                <p className="mt-1 text-xs text-steel-muted">Mobile or card</p>
              </div>
              <div className="border-l border-hairline/60 pl-3">
                <p className="eyebrow">Support</p>
                <p className="mt-1 text-xs text-steel-muted">Ask before deciding</p>
              </div>
            </div>

            <div className="mt-6 border-t border-hairline/60 pt-5">
              <p className="eyebrow">Listed by</p>
              <p className="mt-2 text-sm font-medium">
                {vehicle.seller.slug ? (
                  <Link href={`/dealers/${vehicle.seller.slug}`} className="hover:text-volt-deep hover:underline">
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
              <Link
                href={`/finance?vehicle=${encodeURIComponent(vehicle.slug)}`}
                className="vds-button vds-button-secondary mt-5 w-full justify-between"
              >
                Finance this vehicle <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </Reveal>
      </div>

      {available && (
        <PinnedVehicleCta
          priceLabel={priceLabel}
          demoDriveHref={demoDriveHref}
          primary={
            mode === 'rental'
              ? { label: 'Reserve', href: '#rental-details' }
              : reserveHref
                ? { label: 'Reserve', href: reserveHref }
                : { label: 'Enquire', href: `/cars/${vehicle.slug}/enquire` }
          }
          whatsappHref={whatsappHref}
        />
      )}

      {similar.length > 0 && (
        <section className="shell mt-section">
          <h2 className="section-heading">More electric + hybrid cars</h2>
          <Reveal stagger={110} className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.slice(0, 3).map((item) => (
              <div key={item.id}><VehicleCard vehicle={item} mode={mode} /></div>
            ))}
          </Reveal>
        </section>
      )}
    </div>
  );
}

