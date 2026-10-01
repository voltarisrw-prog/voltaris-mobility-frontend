'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Expand, Pause, Play, X } from 'lucide-react';
import type { VehicleImage } from '@/types/vehicle';
import { heavy } from '@/features/market/fonts';
import ms from '@/features/market/market.module.css';
import { photoLabels, shapeVars } from './model';
import c from './car.module.css';

const SLIDE_MS = 6000;
const STUDIO = { color: '#eef1f6', light: true };

/** Reads the colour of a photo's own backdrop (its four corners) so the studio can continue it. */
function useBackdrop(src: string | null) {
  const [bg, setBg] = useState(STUDIO);
  useEffect(() => {
    if (!src) return;
    let gone = false;
    const img = new window.Image();
    img.decoding = 'async';
    img.onload = () => {
      try {
        const w = 48;
        const h = Math.max(8, Math.round((img.naturalHeight / img.naturalWidth) * w));
        const cv = document.createElement('canvas');
        cv.width = w;
        cv.height = h;
        const cx = cv.getContext('2d', { willReadFrequently: true });
        if (!cx) return;
        cx.drawImage(img, 0, 0, w, h);
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (const [x0, y0] of [
          [0, 0],
          [w - 4, 0],
          [0, h - 4],
          [w - 4, h - 4],
          [Math.round(w / 2) - 2, 0],
        ] as const) {
          const d = cx.getImageData(x0, y0, 4, 4).data;
          for (let k = 0; k < d.length; k += 4) {
            r += d[k]!;
            g += d[k + 1]!;
            b += d[k + 2]!;
            n++;
          }
        }
        r = Math.round(r / n);
        g = Math.round(g / n);
        b = Math.round(b / n);
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (!gone) setBg({ color: `rgb(${r} ${g} ${b})`, light: lum > 170 });
      } catch {
        /* a photo we cannot read keeps the default studio */
      }
    };
    img.src = `/_next/image?url=${encodeURIComponent(src)}&w=64&q=75`;
    return () => {
      gone = true;
    };
  }, [src]);
  return bg;
}

/**
 * The car, whole and huge, standing in a lit studio that continues the photo's
 * own backdrop — no frame, no crop, nothing written on it. The model's name
 * runs behind the car like lettering on a showroom wall. Click or tap for the
 * full-screen view; several photos get labelled tabs that move on by themselves.
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
  const [cur, setCur] = useState(0);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [hold, setHold] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const touchX = useRef(0);
  const many = images.length > 1;
  const shot = images[cur] ?? null;
  const bg = useBackdrop(shot ? (shot.thumb ?? shot.card) : null);
  const labels = photoLabels(images.map((i) => i.role));

  const go = useCallback(
    (n: number) => setCur(((n % images.length) + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!many || !playing || hold || open) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => go(cur + 1), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [many, playing, hold, open, cur, go]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };

  return (
    <section className={c.stage} aria-label="Photos">
      <div
        className={c.studio}
        data-light={bg.light ? '' : undefined}
        style={
          {
            '--bg': bg.color,
            '--len': Math.max(3, wordmark.length),
            '--tx': tilt.x.toFixed(3),
            '--ty': tilt.y.toFixed(3),
          } as React.CSSProperties
        }
        onPointerMove={onMove}
        onPointerLeave={() => {
          setTilt({ x: 0, y: 0 });
          setHold(false);
        }}
        onPointerEnter={() => setHold(true)}
        onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? 0)}
        onTouchEnd={(e) => {
          if (!many) return;
          const d = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
          if (Math.abs(d) > 50) go(cur + (d < 0 ? 1 : -1));
        }}
      >
        <span className={c.softbox} aria-hidden="true" />
        <b className={c.word} aria-hidden="true">
          {wordmark}
        </b>
        {images.length === 0 && <span className={c.noPhoto}>Photos coming soon</span>}
        {images.map((im, i) => (
          <button
            key={`${im.gallery}-${i}`}
            type="button"
            className={c.shot}
            data-on={i === cur ? '' : undefined}
            tabIndex={i === cur ? 0 : -1}
            aria-hidden={i === cur ? undefined : true}
            aria-label={`Open the photo full screen: ${im.alt || title}`}
            onClick={() => setOpen(true)}
          >
            <span
              className={c.carBox}
              style={shapeVars(im.width, im.height) as React.CSSProperties}
            >
              <Image
                src={im.gallery ?? im.detail ?? im.card}
                alt={im.alt || title}
                fill
                priority={i === 0}
                sizes="(min-width: 1440px) 1360px, 100vw"
                placeholder={im.blur_data_url ? 'blur' : 'empty'}
                blurDataURL={im.blur_data_url}
              />
            </span>
          </button>
        ))}
        <span className={c.floor} aria-hidden="true" />
      </div>

      {images.length > 0 && (
        <div className={c.tabs} data-many={many ? '' : undefined}>
          {many ? (
            <div className={c.tabList} role="tablist" aria-label="Choose a photo">
              {images.map((im, i) => (
                <button
                  key={`t-${im.thumb}-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === cur}
                  className={c.tab}
                  onClick={() => go(i)}
                  onFocus={() => setHold(true)}
                  onBlur={() => setHold(false)}
                >
                  <span className={c.tabThumb}>
                    <Image src={im.thumb ?? im.card} alt="" fill sizes="96px" />
                  </span>
                  <span className={c.tabLabel}>{labels[i]}</span>
                  {i === cur && playing && !hold && !open && (
                    <i
                      key={`p-${cur}`}
                      className={c.tabRun}
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
            {many && (
              <>
                <button
                  type="button"
                  className={c.round}
                  aria-label="Previous photo"
                  onClick={() => go(cur - 1)}
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={c.round}
                  aria-label={playing ? 'Pause the photos' : 'Play the photos'}
                  onClick={() => setPlaying((p) => !p)}
                >
                  {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  className={c.round}
                  aria-label="Next photo"
                  onClick={() => go(cur + 1)}
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              </>
            )}
            <button type="button" className={c.full} onClick={() => setOpen(true)}>
              <Expand aria-hidden="true" />
              Full screen
            </button>
          </div>
        </div>
      )}

      {open && images.length > 0 && (
        <Viewer
          images={images}
          start={cur}
          title={title}
          labels={labels}
          onClose={() => setOpen(false)}
          onShow={go}
        />
      )}
    </section>
  );
}

/* ───────────── full screen: the same viewer as the marketplace, for one car's photos ───────────── */

function Viewer({
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
  onShow: (i: number) => void;
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
      onShow(k);
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
