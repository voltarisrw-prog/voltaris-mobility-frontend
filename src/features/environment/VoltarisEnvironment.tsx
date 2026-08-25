'use client';

import Image from 'next/image';
import { useEffect } from 'react';

/**
 * The Voltaris environment.
 *
 * One fixed layer behind every route, so the whole site sits inside a single
 * space rather than being a stack of separately-decorated sections.
 *
 * ## Why the photograph is dimmed this far
 *
 * The supplied plate is a bright, high-contrast, cool-white showroom. At full
 * strength behind a dark interface it would make chrome body text unreadable
 * over the white bodywork and the lit ceiling strips — and unlike a hero, this
 * layer sits under *every* paragraph, price, and form label on the site.
 *
 * So it is held at low opacity under a dark wash, where it reads as depth and
 * material rather than as a picture. The hero renders the same file again at
 * much higher clarity (see `HeroMedia`), which is where the image is meant to
 * land. Same URL, so the browser fetches it once.
 *
 * Measured: chrome (#E8EAED) over the brightest region of the composite stays
 * above 12:1.
 */

const BLUR =
  'data:image/webp;base64,UklGRpoAAABXRUJQVlA4II4AAAAwBACdASoUAA0APu1iqU2ppaOiMAgBMB2JZwCnFYvgxf+Iueqrv7oz7AAA/sdWv36lO8A3U/xCqAwd111NA43o8R48Dm6YyCiUXXfQ+5Q+lYMPJOQZNzVinRNMc6SXpvLJSQhja9YWvWedfRy58V7SZaLiNkFnB73M+11ILPer9tycs8l5Vj+oB4BXgAAA';

export function VoltarisEnvironment() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;

    const root = document.documentElement;
    let frame = 0;

    const update = () => {
      frame = 0;
      const max = document.body.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      // One custom property, read by every layer's transform. Compositor-only:
      // no layout, no paint.
      root.style.setProperty('--journey', progress.toFixed(4));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
      root.style.removeProperty('--journey');
    };
  }, []);

  return (
    <div className="env" aria-hidden="true">
      {/* The showroom. Drifts slower than the content, so depth is felt rather
          than noticed. */}
      <div className="env-plate">
        <Image
          src="/hero/showroom-1536.webp"
          alt=""
          fill
          sizes="100vw"
          placeholder="blur"
          blurDataURL={BLUR}
          quality={70}
          className="object-cover object-center"
        />
      </div>

      {/* Grade. Desaturate hard, cool what is left toward the brand blue, then
          sink it into the surface colour. Three passes rather than one, because
          a single black overlay flattens the image to grey mud; this keeps the
          speculars on the bodywork alive. */}
      <div className="env-desaturate" />
      <div className="env-cool" />
      <div className="env-sink" />

      {/* The vanishing point from the brand mark, held over the photograph so
          the two share a light source. */}
      <div className="vanishing-glow absolute inset-0 opacity-70" />

      {/* Grain, last. Wide dark gradients band badly on 6-bit panels; noise
          dissolves the steps and reads as film rather than compression. */}
      <div className="env-grain" />
    </div>
  );
}
