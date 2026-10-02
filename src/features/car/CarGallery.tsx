'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { VehicleImage } from '@/types/vehicle';
import { photoLabels, shapeVars } from './model';
import { closeUps } from './photo';
import { usePhotoInfo, Viewer } from './CarStage';
import c from './car.module.css';

const SLIDE_MS = 5000;

interface View {
  key: string;
  image: VehicleImage;
  /** Which real photo this is (or is a close-up of), for the full-screen viewer. */
  photo: number;
  label: string;
  caption: string;
  zoom: number;
  cx: number;
  cy: number;
}

const srcOf = (im: VehicleImage) => im.gallery ?? im.detail ?? im.card;

/** The photo, or a close-up of it: the chosen point moved to the centre, then enlarged. */
function Shot({ view, sizes, priority }: { view: View; sizes: string; priority?: boolean }) {
  const close = view.zoom > 1;
  return (
    <span
      className={c.galBox}
      style={shapeVars(view.image.width, view.image.height) as React.CSSProperties}
    >
      <Image
        src={srcOf(view.image)}
        alt={
          close
            ? `${view.image.alt || 'The car'} — ${view.label.toLowerCase()}, up close`
            : view.image.alt || ''
        }
        fill
        sizes={close ? `(min-width: 1024px) 1600px, 220vw` : sizes}
        priority={priority}
        className={close ? c.galZoom : undefined}
        style={
          close
            ? ({
                '--z': view.zoom,
                '--dx': `${(0.5 - view.cx) * 100}%`,
                '--dy': `${(0.5 - view.cy) * 100}%`,
              } as React.CSSProperties)
            : undefined
        }
      />
    </span>
  );
}

/**
 * The gallery: one big card that moves through the photos by itself, with the
 * whole set as labelled tabs underneath — the tab after the current one is
 * where the next picture comes from. A listing with few photos gets close-ups
 * of its main photo (front, wheels, roofline), framed on the car itself.
 */
export function CarGallery({ images, title }: { images: VehicleImage[]; title: string }) {
  const hero = images[0] ?? null;
  const info = usePhotoInfo(hero ? srcOf(hero) : null);
  const views = useMemo<View[]>(() => {
    if (!hero) return [];
    const labels = photoLabels(images.map((i) => i.role));
    const out: View[] = images.map((im, i) => ({
      key: `p${i}`,
      image: im,
      photo: i,
      label: i === 0 ? 'Whole car' : labels[i]!,
      caption: im.alt || title,
      zoom: 1,
      cx: 0.5,
      cy: 0.5,
    }));
    for (const z of closeUps(info)) {
      if (out.length >= 4) break;
      out.push({ key: `z${z.label}`, image: hero, photo: 0, ...z });
    }
    return out;
  }, [images, hero, info, title]);

  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hold, setHold] = useState(false);
  const [seen, setSeen] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null);
  const touchX = useRef(0);
  const count = views.length;
  const go = useCallback((n: number) => setCur(((n % count) + count) % count), [count]);

  // Only run while the gallery is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(Boolean(e?.isIntersecting)), {
      threshold: 0.35,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = count > 1 && playing && !hold && seen && open === null;
  useEffect(() => {
    if (!running) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => go(cur + 1), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [running, cur, go]);

  if (count === 0) return null;
  const view = views[cur]!;
  const next = (cur + 1) % count;

  return (
    <section
      ref={ref}
      className={`${c.slab} ${c.gal}`}
      aria-roledescription="carousel"
      aria-label="Gallery"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHold(true)}
      onPointerLeave={() => setHold(false)}
    >
      <div
        className={c.galFrame}
        style={{ '--bg': info.bg, ...shapeVars(hero!.width, hero!.height) } as React.CSSProperties}
        onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? 0)}
        onTouchEnd={(e) => {
          const d = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
          if (Math.abs(d) > 50) go(cur + (d < 0 ? 1 : -1));
        }}
      >
        {views.map((v, i) => (
          <button
            key={v.key}
            type="button"
            className={c.galSlide}
            data-on={i === cur ? '' : undefined}
            tabIndex={i === cur ? 0 : -1}
            aria-hidden={i === cur ? undefined : true}
            aria-label={`Open full screen: ${v.caption}`}
            onClick={() => setOpen(v.photo)}
          >
            <Shot view={v} sizes="(min-width: 1024px) 800px, 100vw" priority={i === 0} />
          </button>
        ))}
        <span className={c.galCount} aria-live="polite">
          {cur + 1} / {count}
        </span>
        <span className={c.galCap}>{view.caption}</span>
        {count > 1 && (
          <>
            <button
              type="button"
              className={`${c.galArrow} ${c.galPrev}`}
              aria-label="Previous photo"
              onClick={() => go(cur - 1)}
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${c.galArrow} ${c.galNext}`}
              aria-label="Next photo"
              onClick={() => go(cur + 1)}
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className={c.galBar}>
          <div className={c.galTabs} role="tablist" aria-label="Choose a photo">
            {views.map((v, i) => (
              <button
                key={`t-${v.key}`}
                type="button"
                role="tab"
                aria-selected={i === cur}
                data-next={i === next ? '' : undefined}
                className={c.galTab}
                onClick={() => go(i)}
                onFocus={() => setHold(true)}
                onBlur={() => setHold(false)}
              >
                <span className={c.galThumb} style={{ '--bg': info.bg } as React.CSSProperties}>
                  <Shot view={v} sizes="120px" />
                </span>
                <span className={c.galLabel}>
                  {i === next && running ? <em>Next</em> : null}
                  {v.label}
                </span>
                {i === cur && running && (
                  <i
                    key={`run-${cur}`}
                    className={c.galRun}
                    style={{ animationDuration: `${SLIDE_MS}ms` }}
                  />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={c.galPlay}
            aria-label={playing ? 'Pause the gallery' : 'Play the gallery'}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </button>
        </div>
      )}

      {open !== null && (
        <Viewer
          images={images}
          start={open}
          title={title}
          labels={photoLabels(images.map((i) => i.role))}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}
