'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { VehicleImage } from '@/types/vehicle';

const AUTO_SLIDE_MS = 6500;

export interface ShowcaseNumber {
  value: string;
  label: string;
}

/**
 * The vehicle's digital showroom: the model name as an outlined wordmark
 * behind the photograph, the photograph itself given the whole width, and
 * one strip beneath it that says everything a buyer asks first — who made
 * it, what it is, what it costs, and the three numbers that carry the car —
 * with the rest of the photos to the right.
 *
 * One photo still renders (most listings start with one); the strip simply
 * has no thumbnails. Every photo opens the same lightbox.
 */
export function VehicleShowcase({
  images,
  title,
  make,
  model,
  variant,
  year,
  meta,
  priceLabel,
  numbers,
}: {
  images: VehicleImage[];
  title: string;
  make: string;
  model: string;
  variant?: string | null;
  year: number;
  /** "Available for purchase · Used · Kigali" */
  meta: string;
  priceLabel: string;
  numbers: ShowcaseNumber[];
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const current = images[active];
  const thumbs = images.slice(0, 3);
  const overflow = images.length - thumbs.length;

  useEffect(() => {
    if (images.length <= 1 || open) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(
      () => setActive((i) => (i + 1) % images.length),
      AUTO_SLIDE_MS,
    );
    return () => window.clearInterval(timer);
  }, [images.length, open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'ArrowRight') setActive((i) => (i + 1) % images.length);
      if (event.key === 'ArrowLeft') setActive((i) => (i - 1 + images.length) % images.length);
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, images.length]);

  return (
    <>
    <section className="relative isolate overflow-hidden bg-abyss" aria-label={`${title} showroom`}>
      {/* The model name, drawn once, behind the car. */}
      <div
        aria-hidden="true"
        className="wordmark-outline pointer-events-none absolute inset-x-0 top-[clamp(0.75rem,2.5vw,2rem)] select-none text-center"
      >
        {model}
      </div>

      {/* Stage */}
      <div className="relative mx-auto mt-[clamp(3.25rem,11.5vw,10.25rem)] w-full max-w-shell px-gutter">
        {current ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative block aspect-[4/3] w-full overflow-hidden text-left sm:aspect-[16/9] lg:aspect-[21/9]"
            aria-label={`Open photo ${active + 1} of ${images.length}`}
          >
            <Image
              key={current.detail}
              src={current.detail}
              alt={current.alt || title}
              fill
              sizes="(min-width: 1312px) 1312px, 100vw"
              className="gallery-in object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.012] [view-transition-name:vehicle-hero]"
              priority
              fetchPriority="high"
              {...(current.blur_data_url
                ? { placeholder: 'blur' as const, blurDataURL: current.blur_data_url }
                : {})}
            />
            <span className="absolute right-4 top-4 border border-ink/15 bg-white/70 px-3 py-2 font-data text-[0.6875rem] uppercase tracking-[0.14em] text-chrome backdrop-blur-md transition-colors group-hover:border-ink/50 sm:right-5 sm:top-5">
              {images.length > 1 ? `Explore ${images.length} photos` : 'View photo'}
            </span>
          </button>
        ) : (
          <div className="flex aspect-[16/9] items-center justify-center bg-slab font-data text-eyebrow uppercase text-steel-muted">
            Photos coming soon
          </div>
        )}
      </div>

      {/* Strip: identity · price + numbers · photos */}
      <div className="mx-auto w-full max-w-shell px-gutter pb-[clamp(2rem,4vw,3.5rem)] pt-[clamp(1.5rem,3vw,2.75rem)]">
        <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-end xl:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <p className="font-data text-[0.6875rem] uppercase tracking-[0.22em] text-steel-muted">{meta}</p>
            <h1 className="mt-3">
              <span className="block font-data text-eyebrow font-medium uppercase tracking-[0.2em] text-chrome">
                {make} · {year}
              </span>
              <span className="mt-1 block font-display text-headline uppercase leading-none tracking-[0.04em] text-metal-deep">
                {model}
                {variant ? ` ${variant}` : ''}
              </span>
            </h1>
            <p className="mt-3 font-display text-[clamp(1.35rem,2.2vw,1.9rem)] leading-none tabular-nums text-chrome">
              {priceLabel}
            </p>
          </div>

          <dl className="flex flex-wrap items-end gap-x-[clamp(1.75rem,3.5vw,3.25rem)] gap-y-6 lg:flex-nowrap lg:justify-center">
            {numbers.map((n) => (
              <div key={n.label}>
                <dt className="font-data text-[0.7rem] uppercase tracking-[0.18em] text-steel-muted">{n.label}</dt>
                <dd className="mt-1.5 whitespace-nowrap font-display text-[clamp(1.5rem,2.4vw,2.1rem)] leading-none tabular-nums text-chrome">
                  {n.value}
                </dd>
              </div>
            ))}
          </dl>

          {thumbs.length > 1 && (
            <ul className="flex gap-2 lg:col-span-2 lg:justify-end xl:col-span-1" aria-label="Photos">
              {thumbs.map((image, index) => {
                const isLast = index === thumbs.length - 1 && overflow > 0;
                return (
                  <li key={`${image.thumb}-${index}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setActive(index);
                        setOpen(true);
                      }}
                      aria-label={`View photo ${index + 1} of ${images.length}`}
                      aria-current={index === active ? 'true' : undefined}
                      className={`relative block aspect-[16/10] w-[7.5rem] overflow-hidden bg-slab transition-opacity sm:w-[9rem] xl:w-[6.75rem] 2xl:w-[8.5rem] ${
                        index === active ? 'ring-1 ring-ink' : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={image.thumb}
                        alt={image.alt || title}
                        fill
                        sizes="144px"
                        className="object-cover"
                        loading="lazy"
                      />
                      {isLast && (
                        <span className="absolute inset-0 flex items-center justify-center bg-ink/55 font-data text-sm text-white">
                          +{overflow}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

    </section>

      {/* Lightbox lives outside the section's stacking context so it covers the header. */}
      {open && current && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 sm:p-8"
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
                onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/30 text-white backdrop-blur-md transition-colors hover:border-white sm:left-6"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setActive((i) => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/30 text-white backdrop-blur-md transition-colors hover:border-white sm:right-6"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div className="relative h-[82vh] w-full max-w-7xl">
            <Image
              key={current.gallery}
              src={current.gallery}
              alt={current.alt || title}
              fill
              sizes="100vw"
              className="gallery-in object-contain object-center"
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
