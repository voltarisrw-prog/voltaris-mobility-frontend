'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_INFO, readPhoto, silhouette, WHOLE, type PhotoInfo } from '@/features/car/photo';
import type { CoverCard } from './cards';
import { Arrow, Roll } from './text';
import s from './home.module.css';

const SLIDE_MS = 5000;

const shape = (c: CoverCard) =>
  ({
    '--ar': `${c.width} / ${c.height}`,
    '--arn': String(c.width / c.height),
  }) as React.CSSProperties;

/**
 * What the studio reads from a photo: its backdrop colour and the car's
 * outline. `of` says which photo the reading is for — until the new one is
 * read, the studio keeps the last colour but cuts no lettering.
 */
function usePhotoInfo(src: string | null): { info: PhotoInfo; of: string | null } {
  const [state, setState] = useState<{ info: PhotoInfo; of: string | null }>({
    info: DEFAULT_INFO,
    of: null,
  });
  useEffect(() => {
    if (!src) return;
    let gone = false;
    readPhoto(src).then((info) => !gone && setState({ info, of: src }));
    return () => {
      gone = true;
    };
  }, [src]);
  return state;
}

/**
 * The showroom: one car at a time, whole and large, in a lit studio that
 * continues the photo's own backdrop. Its model's name runs across the wall
 * behind it — cut away along the car's outline, so the car stands in front.
 * It moves on by itself while on screen; the tabs underneath show every car,
 * with NEXT on the one coming up.
 */
export function Showroom({ cards }: { cards: CoverCard[] }) {
  const count = cards.length;
  const [at, setAt] = useState(0);
  const cur = count ? Math.min(at, count - 1) : 0;
  const next = count ? (cur + 1) % count : 0;
  const car = cards[cur]!;
  const { info, of } = usePhotoInfo(car.image);
  const upNext = cards[next]?.image;
  // Read the next car's photo ahead of time, so its lettering is ready on arrival.
  useEffect(() => {
    if (upNext) void readPhoto(upNext);
  }, [upNext]);

  const [playing, setPlaying] = useState(true);
  const [hold, setHold] = useState(false);
  const [seen, setSeen] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [rect, setRect] = useState<{ l: number; t: number; w: number; h: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const shot = useRef<HTMLAnchorElement>(null);
  const box = useRef<HTMLSpanElement | null>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const touchX = useRef(0);

  const go = useCallback((n: number) => count > 0 && setAt(((n % count) + count) % count), [count]);

  // Where the car on show sits in the studio, to line its outline up with it.
  useEffect(() => {
    const a = shot.current;
    const b = box.current;
    if (!a || !b) return;
    const measure = () =>
      setRect({
        l: a.offsetLeft + b.offsetLeft,
        t: a.offsetTop + b.offsetTop,
        w: b.offsetWidth,
        h: b.offsetHeight,
      });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(a);
    ro.observe(b);
    return () => ro.disconnect();
  }, [car.id]);

  // Keep the current tab in view along the strip (sideways only).
  useEffect(() => {
    const strip = tabs.current;
    const tab = strip?.children[cur] as HTMLElement | undefined;
    if (!strip || !tab || strip.scrollWidth <= strip.clientWidth) return;
    strip.scrollTo({
      left: tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2,
      behavior: 'smooth',
    });
  }, [cur]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(Boolean(e?.isIntersecting)), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = count > 1 && playing && !hold && seen;
  useEffect(() => {
    if (!running) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => go(cur + 1), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [running, cur, go]);

  const mask = useMemo(
    () =>
      info.plain && car.image && of === car.image
        ? silhouette(info.shape, WHOLE, car.width / car.height)
        : null,
    [info, of, car],
  );
  const lettering = Boolean(mask && rect);
  // The name moves one way and the car the other (−22/+14 px, −12/+8 px), so
  // the cut-out follows the car by the difference.
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
    <div
      ref={root}
      className={`${s.w} ${s.sr} ${s.rv}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured vehicles"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHold(true)}
      onPointerLeave={() => setHold(false)}
    >
      <div className={s.srCard}>
        <div
          className={s.srStudio}
          data-light={info.light ? '' : undefined}
          style={
            {
              '--bg': info.bg,
              '--tx': tilt.x.toFixed(3),
              '--ty': tilt.y.toFixed(3),
              '--len': Math.max(3, car.wordmark.length),
            } as React.CSSProperties
          }
          onPointerMove={(e) => {
            if (e.pointerType !== 'mouse') return;
            const r = e.currentTarget.getBoundingClientRect();
            setTilt({
              x: (e.clientX - r.left) / r.width - 0.5,
              y: (e.clientY - r.top) / r.height - 0.5,
            });
          }}
          onPointerLeave={() => setTilt({ x: 0, y: 0 })}
          onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? 0)}
          onTouchEnd={(e) => {
            const d = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
            if (Math.abs(d) > 50) go(cur + (d < 0 ? 1 : -1));
          }}
        >
          <span className={s.srSoft} aria-hidden="true" />
          <b
            key={car.id}
            className={s.srWord}
            aria-hidden="true"
            data-ready={lettering ? '' : undefined}
            style={wordMask}
          >
            {car.wordmark}
          </b>
          <Link
            ref={shot}
            className={s.srShot}
            href={car.viewHref}
            aria-label={`View the ${car.year} ${car.title}`}
          >
            {cards.map((c, i) => (
              <span
                key={c.id}
                ref={i === cur ? box : null}
                className={s.srBox}
                data-on={i === cur ? '' : undefined}
                aria-hidden={i === cur ? undefined : true}
                style={shape(c)}
              >
                {c.image && (
                  <Image
                    src={c.image}
                    alt={c.alt}
                    fill
                    priority={i === 0}
                    sizes="(min-width: 1160px) 1080px, 100vw"
                  />
                )}
              </span>
            ))}
          </Link>
          <span className={s.srFloor} aria-hidden="true" />
          {count > 1 && (
            <>
              <span className={s.srCount} aria-live="polite">
                {cur + 1} / {count}
              </span>
              <button
                type="button"
                className={`${s.srArrow} ${s.srPrev}`}
                aria-label="Previous vehicle"
                onClick={() => go(cur - 1)}
              >
                <Arrow size={18} flip />
              </button>
              <button
                type="button"
                className={`${s.srArrow} ${s.srNext}`}
                aria-label="Next vehicle"
                onClick={() => go(cur + 1)}
              >
                <Arrow size={18} />
              </button>
            </>
          )}
        </div>

        <div className={s.srInfo} key={car.id}>
          <div className={s.srName}>
            <small>
              {car.year} · {car.city}
            </small>
            <h3>{car.title}</h3>
          </div>
          <div className={s.srPrice}>
            {car.price && <b>{car.price}</b>}
            {car.verified && <span className={s.vf}>Verified</span>}
          </div>
          <div className={s.srActs}>
            <Link href={car.viewHref}>
              <Roll>View vehicle</Roll>
            </Link>
            <Link href={car.dealHref}>
              <Roll>{car.dealLabel}</Roll>
            </Link>
          </div>
        </div>
      </div>

      {count > 1 && (
        <div className={s.srBar}>
          <div ref={tabs} className={s.srTabs} role="tablist" aria-label="Choose a vehicle">
            {cards.map((c, i) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={i === cur}
                data-next={i === next ? '' : undefined}
                className={s.srTab}
                onClick={() => go(i)}
                onFocus={() => setHold(true)}
                onBlur={() => setHold(false)}
              >
                <span className={s.srThumb}>
                  {c.image && <Image src={c.image} alt="" fill sizes="180px" />}
                </span>
                <span className={s.srLabel}>
                  {i === next && running ? <em>Next</em> : null}
                  <span>{c.title}</span>
                </span>
                {i === cur && running && (
                  <i
                    key={`run-${cur}`}
                    className={s.srRun}
                    style={{ animationDuration: `${SLIDE_MS}ms` }}
                  />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={s.srPlay}
            aria-label={playing ? 'Pause the showroom' : 'Play the showroom'}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5l11 7-11 7z" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
