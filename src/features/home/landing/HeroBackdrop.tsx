'use client';

import { getImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import s from './home.module.css';

/** The home page's own hero photographs, the same set the hero has always shown. */
const HERO_IMAGES = [
  '/hero/gallery/hero-01.png',
  '/hero/gallery/hero-02.png',
  '/hero/gallery/hero-03.png',
  '/hero/gallery/hero-04.png',
  '/hero/gallery/hero-05.jpeg',
];

/**
 * The photographs behind the hero, shown as they are: no tint, no shade, no
 * blur. Tablets and computers get the original files, untouched; phones get a
 * sharp copy sized for their screen, so the first view stays quick on mobile
 * data. Only the first photo loads with the page; the next one is fetched
 * while the one before it is on show, and they cross-fade every five seconds.
 */
export function HeroBackdrop() {
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, true>>({});

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => {
      // Only move on to a photo that has arrived; otherwise hold this one.
      setActive((a) => {
        const n = (a + 1) % HERO_IMAGES.length;
        return loaded[n] ? n : a;
      });
    }, 5000);
    return () => window.clearInterval(t);
  }, [loaded]);

  // Photos that have arrived stay; while one is on show, the one after it is
  // fetched — and only that one.
  const highest = Math.max(-1, ...Object.keys(loaded).map(Number));
  const mounted = Math.min(
    HERO_IMAGES.length,
    Math.max(highest + 1, active + (loaded[active] ? 2 : 1)),
  );

  const arrived = (i: number) => setLoaded((l) => (l[i] ? l : { ...l, [i]: true }));

  return (
    <div className={s.bgp} aria-hidden="true">
      {HERO_IMAGES.slice(0, mounted).map((src, i) => {
        const phone = getImageProps({ src, alt: '', fill: true, sizes: '100vw' }).props;
        return (
          <picture key={src}>
            <source media="(min-width: 768px)" srcSet={src} />
            <source media="(max-width: 767px)" srcSet={phone.srcSet} sizes="100vw" />
            <img
              src={src}
              alt=""
              decoding="async"
              fetchPriority={i === 0 ? 'high' : 'low'}
              className={i === active && loaded[i] ? s.ld : undefined}
              // A photo already in the browser's cache can finish before the
              // page is interactive and never report its load.
              ref={(el) => {
                if (el?.complete && el.naturalWidth) arrived(i);
              }}
              onLoad={() => arrived(i)}
            />
          </picture>
        );
      })}
    </div>
  );
}
