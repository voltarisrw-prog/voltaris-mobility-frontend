'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { VehicleDetail } from '@/types/vehicle';

export function VehicleGallery({
  vehicle,
  title,
}: {
  vehicle: VehicleDetail;
  title: string;
}) {
  const images = vehicle.images ?? [];
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const current = images[active];

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'ArrowRight') {
        setActive((index) => (index + 1) % images.length);
      }
      if (event.key === 'ArrowLeft') {
        setActive((index) => (index - 1 + images.length) % images.length);
      }
    }

    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, images.length]);

  if (!current) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center bg-slab font-data text-eyebrow uppercase text-steel-muted">
        Photos coming soon
      </div>
    );
  }

  const visibleImages = images.slice(0, 6);

  return (
    <>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative block w-full overflow-hidden bg-slab text-left"
          aria-label={`Open photo ${active + 1} of ${images.length}`}
        >
          <div className="relative aspect-[16/10] sm:aspect-[16/9]">
            <Image
              src={current.detail}
              alt={current.alt || title}
              fill
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
              priority
              {...(current.blur_data_url
                ? {
                    placeholder: 'blur' as const,
                    blurDataURL: current.blur_data_url,
                  }
                : {})}
            />

            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
              aria-hidden="true"
            />

            <span className="absolute bottom-5 right-5 border border-white/30 bg-black/25 px-3 py-2 font-data text-[0.6875rem] uppercase tracking-[0.14em] text-white backdrop-blur-md">
              Explore photos
            </span>
          </div>
        </button>

        {visibleImages.length > 1 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {visibleImages.map((image, index) => (
              <button
                key={`${image.gallery}-${index}`}
                type="button"
                onClick={() => {
                  setActive(index);
                  setOpen(true);
                }}
                className={`relative aspect-[4/3] overflow-hidden bg-slab ${
                  index === active
                    ? 'ring-1 ring-chrome'
                    : 'opacity-70 transition-opacity hover:opacity-100'
                }`}
                aria-label={`View photo ${index + 1} of ${images.length}`}
                aria-current={index === active ? 'true' : undefined}
              >
                <Image
                  src={image.thumb}
                  alt={image.alt || title}
                  fill
                  sizes="(min-width: 640px) 12vw, 30vw"
                  className="object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}

        {images.length > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="font-data text-[0.6875rem] uppercase tracking-[0.14em] text-steel-muted">
              {active + 1} / {images.length} photos
            </span>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="font-data text-[0.6875rem] uppercase tracking-[0.14em] text-chrome transition-colors hover:text-volt"
            >
              View gallery
            </button>
          </div>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photo gallery`}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center border border-white/20 bg-black/30 text-white backdrop-blur-md transition-colors hover:border-white"
            aria-label="Close gallery"
          >
            <X className="h-5 w-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActive((index) => (index - 1 + images.length) % images.length)
                }
                className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/30 text-white backdrop-blur-md transition-colors hover:border-white sm:left-6"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setActive((index) => (index + 1) % images.length)
                }
                className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/30 text-white backdrop-blur-md transition-colors hover:border-white sm:right-6"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div className="relative h-[82vh] w-full max-w-7xl">
            <Image
              src={current.gallery}
              alt={current.alt || title}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 border border-white/20 bg-black/30 px-4 py-2 font-data text-[0.6875rem] uppercase tracking-[0.14em] text-white backdrop-blur-md">
            {active + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
