import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { VehicleSummary } from '@/types/vehicle';
import { toCard } from './cards';
import { words } from './text';

const textOf = (html: string) => html.replace(/<[^>]+>/g, '');

describe('home page words', () => {
  it('gives each heading word its own span, in order, and keeps the accent word in its <em>', () => {
    const html = renderToStaticMarkup(
      <h2>
        {words(
          <>
            Choose your <em>powertrain</em>
          </>,
        )}
      </h2>,
    );
    expect(html.match(/--k:\d+/g)).toEqual(['--k:0', '--k:1', '--k:2']);
    expect(html).toMatch(/<em>.*powertrain.*<\/em>/);
    expect(textOf(html)).toBe('Choose your powertrain');
  });

  it('splits a paragraph into words without losing a character', () => {
    const line = "Not sure where to start? Tell us what you're looking for";
    const html = renderToStaticMarkup(<p>{words(line, 'focus')}</p>);
    expect(html.match(/--k:\d+/g)).toHaveLength(line.split(' ').length);
    expect(textOf(html).replace(/&#x27;/g, "'")).toBe(line);
  });
});

describe('featured vehicle cards', () => {
  const base = {
    id: 'v1',
    slug: 'tesla-model-s-2024-kigali',
    make: 'Tesla',
    model: 'Model S',
    year: 2024,
    price: 148000000,
    currency: 'RWF',
    verified: true,
    listing_mode: 'sale',
    location: { city: 'Kigali', slug: 'kigali' },
    primary_image: {
      thumb: '/t.jpg',
      card: '/c.jpg',
      detail: '/d.jpg',
      gallery: '/g.jpg',
      width: 3,
      height: 2,
      alt: '',
    },
  } as unknown as VehicleSummary;

  it('names the car, places it, and prices it as the site does', () => {
    const c = toCard(base);
    expect(c.title).toBe('Tesla Model S');
    expect(c.city).toBe('Kigali');
    expect(c.price).toMatch(/148,000,000$/);
    expect(c.image).toBe('/d.jpg');
    expect(c.alt).toBe('Tesla Model S');
    expect(c.wordmark).toBe('Model S');
    expect([c.width, c.height]).toEqual([3, 2]);
  });

  it('labels and links the second button by how the car is offered', () => {
    expect(toCard(base)).toMatchObject({
      dealLabel: 'Buy',
      dealHref: '/cars/tesla-model-s-2024-kigali',
    });
    expect(toCard({ ...base, listing_mode: 'rental' })).toMatchObject({
      dealLabel: 'Rent',
      dealHref: '/cars/tesla-model-s-2024-kigali?mode=rental',
    });
    expect(toCard({ ...base, listing_mode: 'sale_and_rental' }).dealLabel).toBe('Buy or rent');
  });

  it('leaves out a price on request and a missing photo', () => {
    const c = toCard({ ...base, price: null, primary_image: null });
    expect(c.price).toBeNull();
    expect(c.image).toBeNull();
  });
});
