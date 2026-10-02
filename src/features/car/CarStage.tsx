'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Expand, Pause, Play, X } from 'lucide-react';
import type { VehicleImage } from '@/types/vehicle';
import { heavy } from '@/features/market/fonts';
import ms from '@/features/market/market.module.css';
import { photoLabels, shapeVars } from './model';
import { closeUps, DEFAULT_INFO, readPhoto, silhouette, type PhotoInfo } from './photo';
import c from './car.module.css';

const SLIDE_MS = 5000;

export const srcOf = (im: VehicleImage) => im.gallery ?? im.detail ?? im.card;

/** The studio's reading of a photo: backdrop colour, outline, framing. */
export function usePhotoInfo(src: string | null): PhotoInfo {
  const [info, setInfo] = useState<PhotoInfo>(DEFAULT_INFO);
  useEffect(() => {
    if (!src) return;
    let gone = false;
    readPhoto(src).then((i) => !gone && setInfo(i));
    return () => {
      gone = true;
    };
  }, [src]);
  return info;
}

/** One thing the stage can show: a photo, or a close-up of one. */
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

const zoomStyle = (v: View) =>
  ({
    '--z': v.zoom,
    '--dx': `${(0.5 - v.cx) * 100}%`,
    '--dy': `${(0.5 - v.cy) * 100}%`,
  }) as React.CSSProperties;

const altOf = (v: View, title: string) =>
  v.zoom > 1
    ? `${v.image.alt || title} — ${v.label.toLowerCase()}, up close`
    : v.image.alt || title;

/**
 * The car, whole and huge, standing in a lit studio that continues the photo's
 * own backdrop — no frame, no crop. The model's name runs across the wall
 * *behind* the car: the lettering is cut away along the car's outline, so the
 * car always stands in front of it.
 *
 * This one card is the gallery. It moves through the photos by itself, with the
 * whole set as labelled tabs underneath — the tab after the current one is
 * where the next picture comes from. A listing with few photos gets close-ups
 * of its main photo (front, wheels, roofline), framed on the car itself; the
 * lettering stays behind the car on those too, the outline enlarged with it.
 * Click or tap for the full-screen view.
 */
export function CarStage({
  images,
  title,
  wordmark,
}: {
  images: VehicleImage[];
  title: string;
  wordmark: string;
}) {
  const hero = images[0] ?? null;
  const heroSrc = hero ? srcOf(hero) : null;
  const heroInfo = usePhotoInfo(heroSrc);
  const labels = useMemo(() => photoLabels(images.map((i) => i.role)), [images]);

  const views = useMemo<View[]>(() => {
    if (!hero) return [];
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
    for (const z of closeUps(heroInfo)) {
      if (out.length >= 4) break;
      out.push({ key: `z${z.label}`, image: hero, photo: 0, ...z });
    }
    return out;
  }, [images, hero, heroInfo, labels, title]);

  const count = views.length;
  const [at, setAt] = useState(0);
  const cur = count ? Math.min(at, count - 1) : 0;
  const next = count ? (cur + 1) % count : 0;
  const view = views[cur] ?? null;
  const info = usePhotoInfo(view ? srcOf(view.image) : heroSrc);

  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [hold, setHold] = useState(false);
  const [seen, setSeen] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [rect, setRect] = useState<{ l: number; t: number; w: number; h: number } | null>(null);
  const secRef = useRef<HTMLElement>(null);
  const shotRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLSpanElement | null>(null);
  const touchX = useRef(0);

  const go = useCallback((n: number) => count > 0 && setAt(((n % count) + count) % count), [count]);

  // Where the photo on show sits in the studio (transforms ignored), to line
  // the outline up with the car.
  useEffect(() => {
    const shot = shotRef.current;
    const box = boxRef.current;
    if (!shot || !box) return;
    const measure = () =>
      setRect({
        l: shot.offsetLeft + box.offsetLeft,
        t: shot.offsetTop + box.offsetTop,
        w: box.offsetWidth,
        h: box.offsetHeight,
      });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(shot);
    return () => ro.disconnect();
  }, [view?.key]);

  // Only move along while the car is on screen.
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(Boolean(e?.isIntersecting)), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = count > 1 && playing && !hold && seen && !open;
  useEffect(() => {
    if (!running) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => go(cur + 1), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [running, cur, go]);

  // The car's outline for the view on show: on a close-up the outline is
  // enlarged exactly as the photo is, and clipped to the box with it.
  const mask = useMemo(() => {
    if (!view || !info.plain) return null;
    const im = view.image;
    return silhouette(info.shape, view, (im.width || 3) / (im.height || 2));
  }, [view, info]);

  const lettering = Boolean(mask && rect);
  // The word moves one way and the car the other (−22/+14 px, −12/+8 px), so the
  // cut-out follows the car by the difference.
  const wordMask: React.CSSProperties | undefined =
    lettering && rect
      ? {
          WebkitMaskImage: `linear-gradient(#000 30%, transparent 92%), url(${mask})`,
          maskImage: `linear-gradient(#000 30%, transparent 92%), url(${mask})`,
          WebkitMaskSize: `100% 100%, ${rect.w}px ${rect.h}px`,
          maskSize: `100% 100%, ${rect.w}px ${rect.h}px`,
          WebkitMaskPosition: `0 0, calc(${rect.l}px + var(--tx) * 36px) calc(${rect.t}px + var(--ty) * 20px)`,
          maskPosition: `0 0, calc(${rect.l}px + var(--tx) * 36px) calc(${rect.t}px + var(--ty) * 20px)`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskComposite: 'source-out',
          maskComposite: 'subtract',
        }
      : undefined;

  return (
    <section
      ref={secRef}
      className={c.stage}
      aria-label="The car"
      aria-roledescription={count > 1 ? 'carousel' : undefined}
    >
      <div
        className={c.studio}
        data-light={info.light ? '' : undefined}
        style={
          {
            '--bg': info.bg,
            '--tx': tilt.x.toFixed(3),
            '--ty': tilt.y.toFixed(3),
            '--len': Math.max(3, wordmark.length),
          } as React.CSSProperties
        }
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHold(true)}
        onPointerMove={(e) => {
          if (e.pointerType !== 'mouse') return;
          const r = e.currentTarget.getBoundingClientRect();
          setTilt({
            x: (e.clientX - r.left) / r.width - 0.5,
            y: (e.clientY - r.top) / r.height - 0.5,
          });
        }}
        onPointerLeave={() => {
          setHold(false);
          setTilt({ x: 0, y: 0 });
        }}
        onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? 0)}
        onTouchEnd={(e) => {
          const d = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
          if (Math.abs(d) > 50) go(cur + (d < 0 ? 1 : -1));
        }}
      >
        <span className={c.softbox} aria-hidden="true" />
        <b
          className={c.word}
          aria-hidden="true"
          data-ready={lettering ? '' : undefined}
          style={wordMask}
        >
          {wordmark}
        </b>
        {!hero && <span className={c.noPhoto}>Photos coming soon</span>}
        {view && (
          <button
            ref={shotRef}
            type="button"
            className={c.shot}
            data-on=""
            aria-label={`Open full screen: ${view.caption}`}
            onClick={() => setOpen(true)}
          >
            {views.map((v, i) => (
              <span
                key={v.key}
                ref={i === cur ? boxRef : null}
                className={c.carBox}
                data-on={i === cur ? '' : undefined}
                data-close={v.zoom > 1 ? '' : undefined}
                aria-hidden={i === cur ? undefined : true}
                style={shapeVars(v.image.width, v.image.height) as React.CSSProperties}
              >
                <Image
                  src={srcOf(v.image)}
                  alt={altOf(v, title)}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1440px) 1360px, 100vw"
                  placeholder={v.zoom === 1 && v.image.blur_data_url ? 'blur' : 'empty'}
                  blurDataURL={v.image.blur_data_url}
                  className={v.zoom > 1 ? c.carZoom : undefined}
                  style={v.zoom > 1 ? zoomStyle(v) : undefined}
                />
              </span>
            ))}
          </button>
        )}
        {count > 1 && view && (
          <>
            <span className={c.galCount} aria-live="polite">
              {cur + 1} / {count}
            </span>
            <span className={c.galCap}>{view.caption}</span>
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
        <span className={c.floor} aria-hidden="true" />
      </div>

      {hero && (
        <div className={c.tabs}>
          {count > 1 ? (
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
                    <span
                      className={c.galBox}
                      style={shapeVars(v.image.width, v.image.height) as React.CSSProperties}
                    >
                      <Image
                        src={srcOf(v.image)}
                        alt=""
                        fill
                        sizes="160px"
                        className={v.zoom > 1 ? c.galZoom : undefined}
                        style={v.zoom > 1 ? zoomStyle(v) : undefined}
                      />
                    </span>
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
          ) : (
            <span />
          )}
          <div className={c.tabTools}>
            {count > 1 && (
              <button
                type="button"
                className={c.galPlay}
                aria-label={playing ? 'Pause the gallery' : 'Play the gallery'}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              </button>
            )}
            <button type="button" className={c.full} onClick={() => setOpen(true)}>
              <Expand aria-hidden="true" />
              Full screen
            </button>
          </div>
        </div>
      )}

      {open && view && (
        <Viewer
          images={images}
          start={view.photo}
          title={title}
          labels={labels}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  );
}

/* ───────────── full screen: the same viewer as the marketplace, for one car's photos ───────────── */

export function Viewer({
  images,
  start,
  title,
  labels,
  onClose,
  onShow,
}: {
  images: VehicleImage[];
  start: number;
  title: string;
  labels: string[];
  onClose: () => void;
  onShow?: (i: number) => void;
}) {
  const [i, setI] = useState(start);
  const [zoom, setZoom] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const touchX = useRef(0);
  const go = useCallback(
    (n: number) => {
      const k = ((n % images.length) + images.length) % images.length;
      setZoom(1);
      setI(k);
      onShow?.(k);
    },
    [images.length, onShow],
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(3, z + 0.5));
      if (e.key === '-') setZoom((z) => Math.max(1, z - 0.5));
    };
    window.addEventListener('keydown', onKey);
    ref.current?.querySelector<HTMLElement>('button')?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, go, i]);

  const im = images[i];
  if (!im) return null;
  const src = im.gallery ?? im.detail ?? im.card;
  const point = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };

  return createPortal(
    <div className={`${ms.portal} ${heavy.variable}`}>
      <div
        ref={ref}
        className={ms.viewer}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} — full screen`}
      >
        <Image className={ms.ambient} src={src} alt="" fill sizes="100vw" aria-hidden="true" />
        <div
          className={ms.canvas}
          data-zoom={zoom > 1 ? '' : undefined}
          onClick={(e) => {
            if (drag.current?.x !== undefined && Math.abs(drag.current.x - e.clientX) > 4) return;
            if (zoom > 1) setZoom(1);
            else {
              const r = e.currentTarget.getBoundingClientRect();
              setOrigin({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
              });
              setZoom(2.2);
            }
          }}
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, y: e.clientY, ox: origin.x, oy: origin.y };
          }}
          onPointerMove={(e) => {
            if (zoom === 1) return;
            if (e.pointerType === 'mouse' && !e.buttons) {
              setOrigin(point(e));
              return;
            }
            const d = drag.current;
            if (!d) return;
            const r = e.currentTarget.getBoundingClientRect();
            setOrigin({
              x: Math.max(0, Math.min(100, d.ox - ((e.clientX - d.x) / r.width) * 100)),
              y: Math.max(0, Math.min(100, d.oy - ((e.clientY - d.y) / r.height) * 100)),
            });
          }}
          onPointerUp={() => {
            window.setTimeout(() => (drag.current = null), 0);
          }}
          onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? 0)}
          onTouchEnd={(e) => {
            if (zoom > 1) return;
            const d = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
            if (Math.abs(d) > 60) go(i + (d < 0 ? 1 : -1));
          }}
          onWheel={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setOrigin({
              x: ((e.clientX - r.left) / r.width) * 100,
              y: ((e.clientY - r.top) / r.height) * 100,
            });
            setZoom((z) => Math.max(1, Math.min(3, z - e.deltaY * 0.002)));
          }}
        >
          <div
            key={src}
            className={ms.canvasImg}
            style={{
              ...(shapeVars(im.width, im.height) as React.CSSProperties),
              transform: `scale(${zoom})`,
              transformOrigin: `${origin.x}% ${origin.y}%`,
            }}
          >
            <span className={ms.carBox}>
              <Image src={src} alt={im.alt || title} fill sizes="100vw" priority />
            </span>
          </div>
        </div>

        <div className={ms.vTop}>
          <span>{images.length > 1 ? `${labels[i]} · ${i + 1} / ${images.length}` : title}</span>
          <span className={ms.vHint}>
            {zoom > 1 ? 'Drag to look around · click to zoom out' : 'Click or scroll to zoom'}
          </span>
          <button type="button" className={ms.vBtn} aria-label="Close" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </div>
        {images.length > 1 && (
          <>
            <button
              type="button"
              className={`${ms.vBtn} ${ms.vPrev}`}
              aria-label="Previous photo"
              onClick={() => go(i - 1)}
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${ms.vBtn} ${ms.vNext}`}
              aria-label="Next photo"
              onClick={() => go(i + 1)}
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
