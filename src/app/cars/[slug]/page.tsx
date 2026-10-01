import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BadgeCheck,
  BatteryCharging,
  ChevronDown,
  Download,
  Gauge,
  History,
  MapPin,
  PlugZap,
  Ruler,
  Zap,
} from 'lucide-react';
import { JsonLd } from '@/components/JsonLd';
import { TrackVehicleView } from '@/components/TrackVehicleView';
import { ApiError } from '@/lib/api/errors';
import { getSimilarVehicles, getVehicleBySlug, listVehicles } from '@/lib/api/vehicles';
import { parseFilters } from '@/lib/vehicles/filters';
import { breadcrumbJsonLd, faqJsonLd, vehicleJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { formatKm, formatPrice } from '@/lib/format';
import { features } from '@/config/features';
import { heavy } from '@/features/market/fonts';
import { BatteryLab } from '@/features/car/BatteryLab';
import { CarBar } from '@/features/car/CarBar';
import { CarStage } from '@/features/car/CarStage';
import { DealCard } from '@/features/car/DealCard';
import {
  bigNumbers,
  conditionLabel,
  nameOf,
  num,
  pickMode,
  shapeVars,
  specGroups,
  storyOf,
  type SpecIcon,
} from '@/features/car/model';
import c from '@/features/car/car.module.css';
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

const SPEC_ICON: Record<SpecIcon, typeof Zap> = {
  battery: BatteryCharging,
  plug: PlugZap,
  gauge: Gauge,
  ruler: Ruler,
  shield: History,
};

/**
 * The car page — one car, presented like a showroom at night.
 *
 *  Stage     the photo whole and huge in a lit studio that continues its own
 *            backdrop; the model's name runs behind the car. Click for full screen.
 *  Name      maker · year · km, the name in display type, four short facts.
 *  Numbers   the four figures people ask first.
 *  Deal      price and every action in one card (sticky beside the content on
 *            wide screens, straight after the numbers on phones). Buy and Rent
 *            share the same look; only what is inside changes.
 *  Story · Try the battery · Specification · Questions · More like this.
 */
export default async function VehiclePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { mode: requestedMode } = await searchParams;
  const vehicle = await loadVehicle(slug);
  const mode = pickMode(vehicle, requestedMode);

  let similar: VehicleSummary[] = [];
  try {
    similar = await getSimilarVehicles(vehicle.id);
  } catch {
    // Related listings are supporting content; their absence must not break the page.
  }
  if (similar.length === 0) {
    // Nothing close enough? Show the newest cars on the same side (buy or rent) instead.
    try {
      const page = await listVehicles({ ...parseFilters({}), mode });
      similar = page.items.filter((s) => s.id !== vehicle.id);
    } catch {
      /* the section is simply left out */
    }
  }

  const title = vehicleTitle(vehicle);
  const name = nameOf(vehicle);
  const story = storyOf(vehicle.description ?? '');
  const numbers = bigNumbers(vehicle);
  const groups = specGroups(vehicle);
  const canBuy = vehicle.listing_mode !== 'rental';
  const canRent = vehicle.listing_mode !== 'sale';
  const available = vehicle.status !== 'sold' && vehicle.status !== 'unavailable';
  const testDriveHref = vehicle.test_drive_available ? `/test-drive?vehicle=${vehicle.id}` : null;
  const reserveHref =
    mode === 'sale' && features.checkout && vehicle.purchase_enabled
      ? `/order?vehicle=${encodeURIComponent(vehicle.slug)}`
      : null;
  const rentalCheckout = features.checkout && vehicle.rental_enabled;
  const whatsappNumber = (vehicle.seller.whatsapp ?? '').replace(/\D/g, '');
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello, I am interested in the ${title} (${vehicle.slug}).`)}`
    : null;
  const priceShort =
    mode === 'rental'
      ? vehicle.rental_price_per_day
        ? `${formatPrice(vehicle.rental_price_per_day, vehicle.currency)} / day`
        : 'Rental on request'
      : formatPrice(vehicle.price, vehicle.currency);
  const barPrimary =
    mode === 'rental'
      ? {
          label: rentalCheckout ? 'Choose dates' : 'Ask to rent',
          href: rentalCheckout ? '#rental-details' : '#deal',
        }
      : reserveHref
        ? { label: 'Reserve', href: reserveHref }
        : testDriveHref
          ? { label: 'Test drive', href: testDriveHref }
          : { label: 'Enquire', href: `/cars/${vehicle.slug}/enquire` };
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Electric + hybrid cars', path: '/cars' },
    { name: vehicle.make, path: `/brands/${vehicle.make.toLowerCase()}` },
    { name: title, path: `/cars/${vehicle.slug}` },
  ];
  const where = vehicle.location.district
    ? `${vehicle.location.district}, ${vehicle.location.city}`
    : vehicle.location.city;
  const longBody = story.body.length > 420;

  return (
    <div className={`${c.car} ${heavy.variable}`} data-car="" data-motion-ignore="">
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

      <CarStage images={vehicle.images ?? []} title={title} wordmark={vehicle.model} />

      <header className={c.ident}>
        <p className={c.eyebrow}>
          {vehicle.make} · {vehicle.year} · {formatKm(vehicle.mileage_km)}
        </p>
        <h1 className={c.name}>
          <span className={c.srOnly}>
            {vehicle.year} {vehicle.make}{' '}
          </span>
          {name}
        </h1>
        <ul className={c.chips}>
          {vehicle.verified && (
            <li data-k="ok">
              <BadgeCheck aria-hidden="true" /> Documents verified
            </li>
          )}
          {vehicle.charging.dc_kw ? (
            <li>
              <Zap aria-hidden="true" /> DC fast charging · {vehicle.charging.port_type}
            </li>
          ) : null}
          <li>{conditionLabel(vehicle.condition)}</li>
          <li>
            <MapPin aria-hidden="true" /> {where}
          </li>
        </ul>
      </header>

      <ul className={c.nums} aria-label="Key figures">
        {numbers.map((n, i) => (
          <li key={n.label} style={{ '--i': i } as React.CSSProperties}>
            <b>
              {n.value}
              {n.unit && <small> {n.unit}</small>}
            </b>
            <span>{n.label}</span>
          </li>
        ))}
      </ul>

      <div className={c.grid}>
        <aside className={c.dealCol} aria-label="Price and next steps">
          <DealCard
            id={vehicle.id}
            slug={vehicle.slug}
            mode={mode}
            canBuy={canBuy}
            canRent={canRent}
            price={vehicle.price}
            perDay={vehicle.rental_price_per_day ?? null}
            currency={vehicle.currency}
            status={vehicle.status}
            financing={vehicle.financing_available}
            testDriveHref={testDriveHref}
            reserveHref={reserveHref}
            whatsappHref={whatsappHref}
            rentalCheckout={rentalCheckout}
            seller={{
              name: vehicle.seller.display_name,
              slug: vehicle.seller.slug,
              type: vehicle.seller.type,
              verified: vehicle.seller.verified,
            }}
          />
        </aside>

        <div className={c.main}>
          {(story.headline || vehicle.features.length > 0) && (
            <section className={`${c.slab} ${c.story}`} aria-label="About this car">
              {story.headline && <h2 className={c.storyHead}>{story.headline}</h2>}
              {story.body &&
                (longBody ? (
                  <details className={c.more}>
                    <summary>
                      <span>{story.body.slice(0, 300).replace(/\s+\S*$/, '')}…</span>
                      <em>
                        Read more <ChevronDown aria-hidden="true" />
                      </em>
                    </summary>
                    <p>{story.body}</p>
                  </details>
                ) : (
                  <p className={c.storyBody}>{story.body}</p>
                ))}
              {vehicle.features.length > 0 && (
                <ul className={c.feats}>
                  {vehicle.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {vehicle.battery_kwh >= 10 && vehicle.range_km >= 80 && (
            <BatteryLab
              rangeKm={vehicle.range_km}
              batteryKwh={vehicle.battery_kwh}
              charging={vehicle.charging}
            />
          )}

          <section className={c.slab} aria-labelledby="specification">
            <div className={c.slabHead}>
              <h2 id="specification" className={c.h2}>
                Specification
              </h2>
              {vehicle.spec_sheet_url && (
                <a
                  href={vehicle.spec_sheet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={c.sheet}
                >
                  <Download aria-hidden="true" /> Spec sheet
                </a>
              )}
            </div>
            <div className={c.specs}>
              {groups.map((g) => {
                const Icon = SPEC_ICON[g.icon];
                return (
                  <div key={g.label} className={c.spec}>
                    <h3>
                      <span className={c.specIcon}>
                        <Icon aria-hidden="true" />
                      </span>
                      {g.label}
                    </h3>
                    <dl>
                      {g.rows.map((r) => (
                        <div key={r.label}>
                          <dt>{r.label}</dt>
                          <dd>{r.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })}
            </div>
          </section>

          {vehicle.faqs.length > 0 && (
            <section className={c.slab} aria-labelledby="questions">
              <h2 id="questions" className={c.h2}>
                Questions people ask
              </h2>
              <div className={c.faqs}>
                {vehicle.faqs.map((f) => (
                  <details key={f.question}>
                    <summary>
                      {f.question}
                      <ChevronDown aria-hidden="true" />
                    </summary>
                    <p>{f.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <section className={c.moreSec} id="more" aria-labelledby="more-h">
          <div className={c.moreHead}>
            <h2 id="more-h" className={c.h2}>
              More like this
            </h2>
            <Link href={mode === 'rental' ? '/rent' : '/buy'} className={c.moreAll}>
              See every car
            </Link>
          </div>
          <ul className={c.moreList}>
            {similar.slice(0, 4).map((s) => (
              <li key={s.id}>
                <SimilarTile car={s} mode={mode} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {available && (
        <CarBar name={name} price={priceShort} primary={barPrimary} whatsappHref={whatsappHref} />
      )}
    </div>
  );
}

function SimilarTile({ car, mode }: { car: VehicleSummary; mode: 'sale' | 'rental' }) {
  const im = car.primary_image;
  const rentable = car.listing_mode !== 'sale' && car.rental_price_per_day;
  const m =
    mode === 'rental' && rentable ? 'rental' : car.listing_mode === 'rental' ? 'rental' : 'sale';
  const price =
    m === 'rental'
      ? car.rental_price_per_day
        ? `${formatPrice(car.rental_price_per_day, car.currency)} / day`
        : 'On request'
      : formatPrice(car.price, car.currency);
  return (
    <Link href={`/cars/${car.slug}?mode=${m}`} className={c.tile}>
      <span className={c.tilePhoto}>
        {im ? (
          <Image
            className={c.tileAmb}
            src={im.card ?? im.detail}
            alt=""
            aria-hidden="true"
            fill
            sizes="120px"
          />
        ) : null}
        {im ? (
          <span className={c.tileBox} style={shapeVars(im.width, im.height) as React.CSSProperties}>
            <Image
              src={im.card ?? im.detail}
              alt={im.alt || `${car.make} ${car.model}`}
              fill
              sizes="(min-width: 1024px) 300px, 70vw"
            />
          </span>
        ) : null}
      </span>
      <span className={c.tileName}>
        {car.make} {nameOf(car)}
      </span>
      <span className={c.tilePrice}>{price}</span>
      <span className={c.tileFacts}>
        <span>{num(car.range_km)} km</span>
        <span>{car.battery_kwh} kWh</span>
        <span>{car.year}</span>
      </span>
    </Link>
  );
}
