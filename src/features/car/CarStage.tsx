'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import type { VehicleImage } from '@/types/vehicle';
import { heavy } from '@/features/market/fonts';
import ms from '@/features/market/market.module.css';
import { photoLabels, shapeVars } from './model';
import { DEFAULT_INFO, readPhoto, type PhotoInfo } from './photo';
import c from './car.module.css';

/** The studio's reading of a photo: backdrop colour, silhouette, framing. */
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

/**
 * The car, whole and huge, standing in a lit studio that continues the photo's
 * own backdrop — no frame, no crop. The model's name runs across the wall
 * *behind* the car: the lettering is cut away along the car's silhouette, so
 * the car always stands in front of it. Click or tap for the full-screen view.
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
  const src = hero ? (hero.gallery ?? hero.detail ?? hero.card) : null;
  const info = usePhotoInfo(src);
  const [open, setOpen] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const shotRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLSpanElement>(null);
  const [rect, setRect] = useState<{ l: number; t: number; w: number; h: number } | null>(null);
  const labels = photoLabels(images.map((i) => i.role));

  // Where the photo sits in the studio (transforms ignored), to line the
  // silhouette up with the car.
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
  }, [src]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };

  const lettering = Boolean(info.plain && info.hull && rect);
  // The word moves one way and the car the other (−22/+14 px, −12/+8 px), so the
  // cut-out follows the car by the difference.
  const wordMask: React.CSSProperties | undefined =
    lettering && rect
      ? {
          WebkitMaskImage: `linear-gradient(#000 30%, transparent 92%), url(${info.hull})`,
          maskImage: `linear-gradient(#000 30%, transparent 92%), url(${info.hull})`,
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
    <section className={c.stage} aria-label="The car">
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
        onPointerMove={onMove}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
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
        {hero && (
          <button
            ref={shotRef}
            type="button"
            className={c.shot}
            data-on=""
            aria-label={`Open the photo full screen: ${hero.alt || title}`}
            onClick={() => setOpen(true)}
          >
            <span
              ref={boxRef}
              className={c.carBox}
              style={shapeVars(hero.width, hero.height) as React.CSSProperties}
            >
              <Image
                src={src!}
                alt={hero.alt || title}
                fill
                priority
                sizes="(min-width: 1440px) 1360px, 100vw"
                placeholder={hero.blur_data_url ? 'blur' : 'empty'}
                blurDataURL={hero.blur_data_url}
              />
            </span>
          </button>
        )}
        <span className={c.floor} aria-hidden="true" />
      </div>

      {hero && (
        <div className={c.tabs}>
          <span />
          <div className={c.tabTools}>
            <button type="button" className={c.full} onClick={() => setOpen(true)}>
              <Expand aria-hidden="true" />
              Full screen
            </button>
          </div>
        </div>
      )}

      {open && hero && (
        <Viewer
          images={images}
          start={0}
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
