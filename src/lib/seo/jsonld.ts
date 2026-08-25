import { site } from '@/config/site';
import { absoluteUrl } from './metadata';
import type { VehicleDetail } from '@/types/vehicle';

type Json = Record<string, unknown>;

export function organizationJsonLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site.url}#organization`,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: absoluteUrl('/brand/voltaris-logo-full.jpeg'),
    email: site.contact.email,
    telephone: site.contact.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    sameAs: Object.values(site.social),
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

const AVAILABILITY: Record<string, string> = {
  available: 'https://schema.org/InStock',
  reserved: 'https://schema.org/LimitedAvailability',
  sold: 'https://schema.org/SoldOut',
  unavailable: 'https://schema.org/OutOfStock',
};

/**
 * Car is a subtype of Product, so a single node carries both the vehicle
 * specification and the offer. Price is omitted entirely when it is on request —
 * emitting a placeholder price would be structured-data spam.
 */
export function vehicleJsonLd(vehicle: VehicleDetail): Json {
  const url = absoluteUrl(`/cars/${vehicle.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Car',
    '@id': `${url}#vehicle`,
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}`,
    url,
    description: vehicle.description.slice(0, 500),
    brand: { '@type': 'Brand', name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    itemCondition:
      vehicle.condition === 'new'
        ? 'https://schema.org/NewCondition'
        : 'https://schema.org/UsedCondition',
    fuelType: 'Electric',
    vehicleEngine: {
      '@type': 'EngineSpecification',
      enginePower: { '@type': 'QuantitativeValue', value: vehicle.power_kw, unitCode: 'KWT' },
    },
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileage_km,
      unitCode: 'KMT',
    },
    numberOfDoors: vehicle.doors,
    seatingCapacity: vehicle.seats,
    driveWheelConfiguration: vehicle.drivetrain.toUpperCase(),
    image: vehicle.images.slice(0, 6).map((img) => img.gallery),
    ...(vehicle.price !== null
      ? {
          offers: {
            '@type': 'Offer',
            price: vehicle.price,
            priceCurrency: vehicle.currency,
            availability: AVAILABILITY[vehicle.status] ?? AVAILABILITY.unavailable,
            url,
            seller: { '@type': 'Organization', name: vehicle.seller.display_name },
            areaServed: { '@type': 'Country', name: 'Rwanda' },
          },
        }
      : {}),
  };
}

/**
 * FAQPage is only valid when the questions and answers are genuinely visible on the
 * page. Callers must pass the same array they render — never a hidden SEO block.
 */
export function faqJsonLd(faqs: { question: string; answer: string }[]): Json | null {
  if (faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  image: string;
  publishedTime: string;
  modifiedTime: string;
  author: string;
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    image: absoluteUrl(input.image),
    datePublished: input.publishedTime,
    dateModified: input.modifiedTime,
    author: { '@type': 'Person', name: input.author },
    publisher: { '@id': `${site.url}#organization` },
    mainEntityOfPage: absoluteUrl(input.path),
  };
}
