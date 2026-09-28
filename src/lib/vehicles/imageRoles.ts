import type { VehicleImage } from '@/types/vehicle';

export interface SpreadImages {
  hero: VehicleImage | null;
  interior: VehicleImage | null;
  detail: VehicleImage[];
  gallery: VehicleImage[];
}

/**
 * Splits a listing's images into the spread's slots. Tagged images win; the
 * rest fall back to order (first = hero, second = interior, next three =
 * detail). A listing with one photo still renders — it just has one spread.
 */
export function splitImages(images: VehicleImage[]): SpreadImages {
  const tagged = images.filter((i) => i.role);
  const untagged = images.filter((i) => !i.role);

  const out: SpreadImages = {
    hero: tagged.find((i) => i.role === 'hero') ?? null,
    interior: tagged.find((i) => i.role === 'interior') ?? null,
    detail: tagged.filter((i) => i.role === 'detail'),
    gallery: tagged.filter((i) => i.role === 'gallery'),
  };

  const queue = [...untagged];
  if (!out.hero) out.hero = queue.shift() ?? null;
  if (!out.interior) out.interior = queue.shift() ?? null;
  while (out.detail.length < 3 && queue.length) out.detail.push(queue.shift()!);
  out.gallery.push(...queue);
  return out;
}
