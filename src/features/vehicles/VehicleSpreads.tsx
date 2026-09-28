import Image from 'next/image';
import type { VehicleImage } from '@/types/vehicle';

function Spread({
  image,
  caption,
  priority = false,
}: {
  image: VehicleImage;
  caption?: string;
  priority?: boolean;
}) {
  return (
    <figure className="relative isolate min-h-[100svh] overflow-hidden bg-black lg:min-h-[85svh]">
      <Image
        src={image.detail}
        alt={image.alt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
        {...(image.blur_data_url ? { placeholder: 'blur', blurDataURL: image.blur_data_url } : {})}
      />
      {caption && (
        <figcaption className="absolute bottom-6 left-0 right-0 px-[clamp(1rem,4vw,4rem)] font-data text-[0.7rem] uppercase tracking-[0.18em] text-white/70 sm:bottom-10">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Interior spread, then the detail strip. On phones the details swipe
 * horizontally (scroll-snap); on desktop they sit three across. Nothing here
 * has a sentence: a caption is two words or none.
 */
export function VehicleSpreads({
  interior,
  detail,
}: {
  interior: VehicleImage | null;
  detail: VehicleImage[];
}) {
  if (!interior && detail.length === 0) return null;
  return (
    <div className="mt-16 sm:mt-24">
      {interior && <Spread image={interior} caption="Interior" />}

      {detail.length > 0 && (
        <ul
          className="mt-1 flex snap-x snap-mandatory gap-1 overflow-x-auto lg:grid lg:grid-cols-3 lg:overflow-visible"
          aria-label="Details"
        >
          {detail.map((image) => (
            <li key={image.detail} className="relative aspect-[4/5] w-[86vw] shrink-0 snap-center bg-black lg:w-auto">
              <Image
                src={image.detail}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 33vw, 86vw"
                className="object-cover"
                {...(image.blur_data_url ? { placeholder: 'blur', blurDataURL: image.blur_data_url } : {})}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
