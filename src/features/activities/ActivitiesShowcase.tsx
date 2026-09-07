'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import { HOME_LIBRARY_IMAGES } from '@/features/home/homeLibraryImages';

export type Activity = {
  slug: string;
  title: string;
  category: string;
  location: string;
  date: string;
  description: string;
  image: string;
};

export const ACTIVITIES: Activity[] = [
  {
    slug: 'weekend-drive-experience',
    title: 'Weekend Drive Experience',
    category: 'Drive experience',
    location: 'Kigali',
    date: 'Every weekend',
    description: 'Take a Voltaris vehicle beyond the showroom and experience the road at your own pace.',
    image: HOME_LIBRARY_IMAGES[0],
  },
  {
    slug: 'kigali-city-drive',
    title: 'Kigali City Drive',
    category: 'City experience',
    location: 'Kigali',
    date: 'Monthly',
    description: 'A curated city route built around Kigali streets, neighbourhoods and everyday mobility.',
    image: HOME_LIBRARY_IMAGES[4],
  },
  {
    slug: 'ev-test-drive-day',
    title: 'EV Test Drive Day',
    category: 'Electric mobility',
    location: 'Kigali',
    date: 'Monthly',
    description: 'Experience electric driving first-hand and compare the vehicles that are changing the way Rwanda moves.',
    image: HOME_LIBRARY_IMAGES[8],
  },
  {
    slug: 'voltaris-car-showcase',
    title: 'Voltaris Car Showcase',
    category: 'Showcase',
    location: 'Kigali',
    date: 'Seasonal',
    description: 'A closer look at selected vehicles, their design, technology and character.',
    image: HOME_LIBRARY_IMAGES[12],
  },
  {
    slug: 'family-road-trip',
    title: 'Family Road Trip',
    category: 'Road experience',
    location: 'Rwanda',
    date: 'Seasonal',
    description: 'Discover practical vehicles through a real-world journey designed around family travel.',
    image: HOME_LIBRARY_IMAGES[16],
  },
  {
    slug: 'rwanda-adventure-drive',
    title: 'Rwanda Adventure Drive',
    category: 'Adventure',
    location: 'Rwanda',
    date: 'Quarterly',
    description: 'Leave the city behind and explore what Rwanda feels like from behind the wheel.',
    image: HOME_LIBRARY_IMAGES[20],
  },
  {
    slug: 'dealer-open-day',
    title: 'Dealer Open Day',
    category: 'Marketplace',
    location: 'Kigali',
    date: 'Monthly',
    description: 'Meet trusted automotive partners, explore vehicles and get practical buying guidance.',
    image: HOME_LIBRARY_IMAGES[24],
  },
  {
    slug: 'ev-charging-experience',
    title: 'EV Charging Experience',
    category: 'EV guide',
    location: 'Kigali',
    date: 'Monthly',
    description: 'Learn how charging works, where it fits into daily life and what EV ownership really feels like.',
    image: HOME_LIBRARY_IMAGES[28],
  },
  {
    slug: 'vehicle-buying-clinic',
    title: 'Vehicle Buying Clinic',
    category: 'Buying',
    location: 'Kigali',
    date: 'Monthly',
    description: 'A practical session for people who want to make a smarter vehicle decision.',
    image: HOME_LIBRARY_IMAGES[32],
  },
  {
    slug: 'kigali-mobility-meetup',
    title: 'Kigali Mobility Meetup',
    category: 'Community',
    location: 'Kigali',
    date: 'Quarterly',
    description: 'Bring together drivers, enthusiasts, dealers and mobility thinkers shaping the next chapter.',
    image: HOME_LIBRARY_IMAGES[36],
  },
  {
    slug: 'lake-kivu-road-trip',
    title: 'Lake Kivu Road Trip',
    category: 'Road trip',
    location: 'Rubavu',
    date: 'Seasonal',
    description: 'A long-form road experience connecting Kigali with the landscapes around Lake Kivu.',
    image: HOME_LIBRARY_IMAGES[42],
  },
  {
    slug: 'rwanda-mobility-future',
    title: 'Rwanda Mobility Future',
    category: 'Insights',
    location: 'Kigali',
    date: 'Annual',
    description: 'A conversation about electric vehicles, smarter ownership and the future of movement in Rwanda.',
    image: HOME_LIBRARY_IMAGES[48],
  },
];

export function ActivitiesShowcase() {
  return (
    <section className="space-y-10 sm:space-y-14">
      <div className="grid gap-6 border-b border-hairline pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">Voltaris activities</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-medium tracking-[-0.055em] text-ink sm:text-6xl lg:text-8xl">
            Move beyond the listing
          </h1>
        </div>

        <p className="max-w-sm text-sm leading-6 text-steel">
          Experiences, drives and gatherings built around the way Rwanda moves
        </p>
      </div>

      <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIVITIES.map((activity, index) => (
          <article
            key={activity.slug}
            className={index % 5 === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}
          >
            <Link
              href={`/activities?activity=${activity.slug}`}
              className="group block"
            >
              <div
                className={
                  index % 5 === 0
                    ? 'relative aspect-[16/9] overflow-hidden bg-black'
                    : 'relative aspect-[4/5] overflow-hidden bg-black'
                }
              >
                <Image
                  src={activity.image}
                  alt={activity.title}
                  fill
                  sizes={
                    index % 5 === 0
                      ? '(max-width: 768px) 100vw, 66vw'
                      : '(max-width: 768px) 100vw, 33vw'
                  }
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                  <p className="font-data text-[0.58rem] uppercase tracking-[0.18em] text-white/70">
                    {activity.category}
                  </p>

                  <h2 className="mt-2 max-w-2xl text-2xl font-medium tracking-[-0.035em] sm:text-3xl">
                    {activity.title}
                  </h2>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/75">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {activity.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {activity.date}
                    </span>
                  </div>
                </div>

                <span className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>

              <p className="mt-4 max-w-xl text-sm leading-6 text-steel">
                {activity.description}
              </p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
