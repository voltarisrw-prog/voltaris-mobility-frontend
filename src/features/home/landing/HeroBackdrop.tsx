'use client';

import Image from 'next/image';
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
 * The photograph behind the hero: drifts with the pointer and the scroll (set
 * on the hero by the page), and moves through the set every five seconds,
 * each one fading in once it has loaded.
 */
export function HeroBackdrop() {
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, true>>({});

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setActive((a) => (a + 1) % HERO_IMAGES.length), 5000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className={s.bgp} aria-hidden="true">
      {HERO_IMAGES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="108vw"
          className={i === active && loaded[i] ? s.ld : undefined}
          onLoad={() => setLoaded((l) => ({ ...l, [i]: true }))}
        />
      ))}
    </div>
  );
}
