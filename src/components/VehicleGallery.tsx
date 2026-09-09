'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { VehicleDetail } from '@/types/vehicle';

const AUTO_SLIDE_MS = 5500;

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
    if (images.length <= 1 || open) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reduceMotion) return;

    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % images.length);
    }, AUTO_SLIDE_MS);

    return () => window.clearInterval(timer);
  }, [images.length, open]);

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
      <div className="relative h-full min-h-[72svh] sm:min-h-[78svh] lg:min-h-[82svh] bg-slab">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group absolute inset-0 block h-full w-full overflow-hidden bg-slab text-left"
          aria-label={`Open photo ${active + 1} of ${images.length}`}
        >
          <Image
            src={current.detail}
            alt={current.alt || title}
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.012]"
            priority
            {...(current.blur_data_url
              ? {
                  placeholder: 'blur' as const,
                  blurDataURL: current.blur_data_url,
                }
              : {})}
          />

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent"
            aria-hidden="true"
          />

          <span className="absolute right-5 top-5 border border-white/25 bg-black/20 px-3 py-2 font-data text-[0.6875rem] uppercase tracking-[0.14em] text-white/90 backdrop-blur-md transition-colors group-hover:border-white/60">
            Explore photos
          </span>
        </button>

        {visibleImages.length > 1 && (
          <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-5 sm:px-8 sm:pb-8">
            <div className="flex items-end justify-between gap-5">
              <div className="flex max-w-[70vw] gap-2 overflow-x-auto pb-1">
                {visibleImages.map((image, index) => (
                  <button
                    key={`${image.gallery}-${index}`}
                    type="button"
                    onClick={() => {
                      setActive(index);
                      setOpen(true);
                    }}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden bg-black/30 backdrop-blur-md sm:h-16 sm:w-24 ${
                      index === active
                        ? 'ring-1 ring-white'
                        : 'opacity-60 transition-opacity hover:opacity-100'
                    }`}
                    aria-label={`View photo ${index + 1} of ${images.length}`}
                    aria-current={index === active ? 'true' : undefined}
                  >
                    <Image
                      src={image.thumb}
                      alt={image.alt || title}
                      fill
                      sizes="96px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>

              <div className="shrink-0 text-right">
                <p className="font-data text-[0.6875rem] uppercase tracking-[0.14em] text-white/70">
                  {active + 1} / {images.length}
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="mt-1 font-data text-[0.6875rem] uppercase tracking-[0.14em] text-white transition-colors hover:text-volt"
                >
                  View gallery
                </button>
              </div>
            </div>
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
              className="object-contain object-center transition-opacity duration-1000 ease-out"
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
