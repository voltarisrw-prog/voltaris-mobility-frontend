'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowUpRight,
  BatteryCharging,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Maximize2,
  X,
} from 'lucide-react';
import { CompareToggleButton } from '@/components/CompareToggleButton';
import { financeDefaults, financePartners } from '@/config/finance';
import { computeLoan, depositFromBps } from '@/lib/finance/amortisation';
import { formatPrice } from '@/lib/format';
import type { VehicleSummary } from '@/types/vehicle';
import { heavy } from './fonts';
import s from './market.module.css';

type Mode = 'sale' | 'rental';

/** Each car glows in one of the company blues, in turn. */
const GLOWS = ['#35a2ff', '#5cc8ff', '#2b6fe0', '#7fd4ff'];
const SLIDE_MS = 5000;
const HERO_COUNT = 5;
const nf = new Intl.NumberFormat('en-US');
const glowOf = (i: number) => GLOWS[i % GLOWS.length] ?? '#35a2ff';
const titleOf = (v: VehicleSummary) => `${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}`;
const srcOf = (v: VehicleSummary) =>
  v.primary_image ? (v.primary_image.detail ?? v.primary_image.card) : null;
/** The photo's own shape, so its frame can match it exactly and its edges can melt away. */
const shapeOf = (v: VehicleSummary): React.CSSProperties => {
  const im = v.primary_image;
  const w = im && im.width > 0 ? im.width : 3;
  const h = im && im.height > 0 ? im.height : 2;
  return { '--ar': `${w} / ${h}`, '--arn': String(w / h) } as React.CSSProperties;
};
/** The largest rendition, for the showroom and the full-screen viewer. */
const bigOf = (v: VehicleSummary) =>
  v.primary_image
    ? (v.primary_image.gallery ?? v.primary_image.detail ?? v.primary_image.card)
    : null;

/** The one-line price under a photo: the full price (Buy) or the day rate (Rent). */
function shortPrice(v: VehicleSummary, mode: Mode): string {
  if (mode === 'rental') {
    return v.rental_price_per_day
      ? `${formatPrice(v.rental_price_per_day, v.currency)} / day`
      : 'On request';
  }
  return v.price !== null ? formatPrice(v.price, v.currency) : 'On request';
}

function useCountUp(target: number, run: boolean, ms = 1200, decimals = 0) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (!run) return;
    let frame = 0;
    const start = from.current;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = reduce ? 1 : Math.min(1, (t - t0) / ms);
      const now = start + (target - start) * (1 - Math.pow(1 - p, 3));
      from.current = now;
      setV(now);
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, run, ms]);
  const f = 10 ** decimals;
  return Math.round(v * f) / f;
}

/* ───────────────────────── small living figures ───────────────────────── */

function RangeFig({ km, glow }: { km: number; glow: string }) {
  const share = Math.max(0.04, Math.min(1, km / 800));
  return (
    <svg viewBox="0 0 120 34" aria-hidden="true" preserveAspectRatio="xMinYMid meet">
      <path
        d="M8 30 A70 70 0 0 1 112 30"
        fill="none"
        stroke="rgba(255,255,255,.12)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M8 30 A70 70 0 0 1 112 30"
        fill="none"
        stroke={glow}
        strokeWidth="6"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${share * 100} 100`}
        style={{ filter: `drop-shadow(0 0 4px ${glow})`, transition: 'stroke-dasharray 1.2s' }}
      />
    </svg>
  );
}

function BatteryFig({ kwh, glow }: { kwh: number; glow: string }) {
  const filled = Math.max(1, Math.min(8, Math.round((kwh / 120) * 8)));
  return (
    <svg viewBox="0 0 120 34" aria-hidden="true" preserveAspectRatio="xMinYMid meet">
      <rect
        x="1"
        y="5"
        width="108"
        height="24"
        rx="6"
        fill="none"
        stroke="rgba(255,255,255,.3)"
        strokeWidth="2"
      />
      <rect x="111" y="12" width="5" height="10" rx="2" fill="rgba(255,255,255,.3)" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x={5 + i * 13}
          y="9"
          width="10"
          height="16"
          rx="2.5"
          fill={i < filled ? glow : 'rgba(255,255,255,.08)'}
        />
      ))}
    </svg>
  );
}

function OdoFig({ km }: { km: number }) {
  const digits = String(Math.round(km)).padStart(6, '0').slice(-6).split('');
  const lead = 6 - String(Math.round(km)).length;
  return (
    <svg viewBox="0 0 120 34" aria-hidden="true" preserveAspectRatio="xMinYMid meet">
      {digits.map((d, i) => (
        <g key={i}>
          <rect
            x={i * 19.5}
            y="3"
            width="17"
            height="28"
            rx="4"
            fill="#050a1d"
            stroke="rgba(255,255,255,.16)"
          />
          <text
            x={i * 19.5 + 8.5}
            y="23"
            textAnchor="middle"
            fontSize="17"
            fontWeight="800"
            fill={i >= lead ? '#fff' : 'rgba(255,255,255,.25)'}
          >
            {d}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Shown only when a listing has no photo yet. */
function CarSilhouette() {
  return (
    <svg className={s.placeholder} viewBox="0 0 480 220" aria-hidden="true">
      <path
        d="M30 170c0-20 30-30 80-38l70-34c32-16 74-26 128-26 58 0 98 14 128 36l60 16c26 7 36 20 36 38v14H30z"
        fill="currentColor"
        opacity=".18"
      />
      <circle cx="138" cy="176" r="30" fill="#050a1d" stroke="currentColor" strokeOpacity=".5" />
      <circle cx="372" cy="176" r="30" fill="#050a1d" stroke="currentColor" strokeOpacity=".5" />
    </svg>
  );
}

/* ───────────────────────── the car card (peek and panel) ───────────────────────── */

function InfoCard({
  vehicle,
  mode,
  index,
  run = true,
}: {
  vehicle: VehicleSummary;
  mode: Mode;
  index: number;
  run?: boolean;
}) {
  const glow = glowOf(index);
  const href = `/cars/${vehicle.slug}?mode=${mode}`;
  const [months, setMonths] = useState<number>(financeDefaults.termMonths);
  const [days, setDays] = useState(3);

  const buy = mode === 'sale';
  const base = buy ? vehicle.price : (vehicle.rental_price_per_day ?? null);
  let value: number | null = null;
  if (base !== null && base > 0) {
    if (buy) {
      const price = Math.round(base);
      value = computeLoan({
        priceRwf: price,
        depositRwf: depositFromBps(price, financeDefaults.depositBps),
        annualRateBps: financePartners[0]?.annualRateBps ?? 1650,
        termMonths: months,
      }).monthlyRwf;
    } else {
      value = Math.round(base) * days;
    }
  }
  const shown = useCountUp(value ?? 0, run && value !== null, 500);
  const range = useCountUp(vehicle.range_km, run, 1100);
  const kwh = useCountUp(vehicle.battery_kwh, run, 1100, 1);
  const mileage = useCountUp(vehicle.mileage_km, run, 1100);
  const sliderValue = buy ? months : days;
  const cellsOn = Math.max(1, Math.round((sliderValue / (buy ? 72 : 14)) * 12));
  const isNew = vehicle.condition === 'new' || vehicle.mileage_km < 100;

  return (
    <div className={s.info} style={{ '--g': glow } as React.CSSProperties}>
      <div className={s.infoTop}>
        <span className={s.kick}>
          {vehicle.status === 'sold' && <span className={s.sold}>Sold</span>}
          {buy ? 'Just arrived' : 'Ready to roll'} · {vehicle.location.city} · {vehicle.year}
        </span>
        <CompareToggleButton
          vehicleId={vehicle.id}
          mode={mode}
          variant="icon"
          className="rounded-full border-white/25 bg-white/5 text-white hover:border-white"
        />
      </div>
      <h2 className={s.name}>
        <Link href={href}>{titleOf(vehicle)}</Link>
      </h2>
      <div className={s.pr}>
        {value === null ? (
          <span className={s.pv}>Price on request</span>
        ) : (
          <>
            <span className={s.pv}>{formatPrice(shown, vehicle.currency)}</span>
            <small>
              {buy
                ? `a month · ${formatPrice(vehicle.price, vehicle.currency)}`
                : `for ${days} ${days > 1 ? 'days' : 'day'} · ${formatPrice(base, vehicle.currency)} a day`}
            </small>
          </>
        )}
      </div>
      {value !== null && (
        <div className={s.slider}>
          <label htmlFor={`r-${vehicle.id}-${run ? 'p' : 'h'}`}>
            <span>{buy ? 'Pay over' : 'Keep it for'}</span>
            <b>{buy ? `${months} months` : `${days} ${days > 1 ? 'days' : 'day'}`}</b>
          </label>
          <div className={s.cells} aria-hidden="true">
            {Array.from({ length: 12 }, (_, k) => (
              <s key={k} data-f={k < cellsOn ? '' : undefined} />
            ))}
          </div>
          <input
            id={`r-${vehicle.id}-${run ? 'p' : 'h'}`}
            className={s.range}
            type="range"
            min={buy ? financeDefaults.minTermMonths : 1}
            max={buy ? financeDefaults.maxTermMonths : 14}
            step={buy ? 12 : 1}
            value={sliderValue}
            onChange={(e) => (buy ? setMonths(+e.target.value) : setDays(+e.target.value))}
          />
        </div>
      )}
      <div className={s.figs}>
        <div className={s.fig}>
          <RangeFig km={run ? vehicle.range_km : 0} glow={glow} />
          <span className={s.num}>
            {nf.format(range)}
            <small>km</small>
          </span>
          <span>range</span>
        </div>
        <div className={s.fig}>
          <BatteryFig kwh={vehicle.battery_kwh} glow={glow} />
          <span className={s.num}>
            {kwh}
            <small>kWh</small>
          </span>
          <span>battery</span>
        </div>
        <div className={s.fig}>
          <OdoFig km={isNew ? 0 : mileage} />
          <span className={s.num}>
            {isNew ? 'New' : nf.format(mileage)}
            {!isNew && <small>km</small>}
          </span>
          <span>{isNew ? String(vehicle.year) : 'on the clock'}</span>
        </div>
      </div>
      <div className={s.acts}>
        {buy ? (
          <>
            <Link
              className={`${s.btn} ${s.primary}`}
              href={`/checkout/start?vehicle=${encodeURIComponent(vehicle.id)}`}
            >
              Order this car
            </Link>
            <Link className={s.btn} href={`/test-drive?vehicle=${encodeURIComponent(vehicle.id)}`}>
              Free demo drive
            </Link>
          </>
        ) : (
          <>
            <Link
              className={`${s.btn} ${s.primary}`}
              href={`/cars/${vehicle.slug}?mode=rental#rental-details`}
            >
              Rent this car
            </Link>
            <Link className={s.btn} href={`/test-drive?vehicle=${encodeURIComponent(vehicle.id)}`}>
              Free demo drive
            </Link>
          </>
        )}
      </div>
      <Link className={s.more} href={href}>
        See every detail <ArrowUpRight aria-hidden="true" />
      </Link>
    </div>
  );
}

/* ───────────────────────── side panel (bottom sheet on phones) ───────────────────────── */

function Panel({
  vehicle,
  mode,
  index,
  onClose,
  onView,
}: {
  vehicle: VehicleSummary;
  mode: Mode;
  index: number;
  onClose: () => void;
  onView: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    ref.current?.querySelector<HTMLElement>('button')?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);
  const img = vehicle.primary_image;
  const src = srcOf(vehicle);
  const ratio = img && img.width > 0 && img.height > 0 ? `${img.width} / ${img.height}` : '3 / 2';
  return createPortal(
    <div className={`${s.portal} ${heavy.variable}`}>
      <div className={s.scrim} onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        className={s.panel}
        role="dialog"
        aria-modal="true"
        aria-label={titleOf(vehicle)}
        style={{ '--g': glowOf(index) } as React.CSSProperties}
      >
        <button type="button" className={s.close} aria-label="Close" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
        <div className={s.panelScroll}>
          <button
            type="button"
            className={s.panelPic}
            style={{ '--ar': ratio } as React.CSSProperties}
            aria-label={`${titleOf(vehicle)} — view full screen`}
            onClick={onView}
          >
            {img && src ? (
              <Image src={src} alt={img.alt || titleOf(vehicle)} fill sizes="480px" />
            ) : (
              <CarSilhouette />
            )}
          </button>
          <InfoCard vehicle={vehicle} mode={mode} index={index} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ───────────────────────── full-screen viewer (zoom and pan) ───────────────────────── */

function Viewer({
  cars,
  start,
  mode,
  onClose,
}: {
  cars: VehicleSummary[];
  start: number;
  mode: Mode;
  onClose: () => void;
}) {
  const [i, setI] = useState(start);
  const [zoom, setZoom] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const touchX = useRef(0);
  const go = useCallback(
    (n: number) => {
      setZoom(1);
      setI((n + cars.length) % cars.length);
    },
    [cars.length],
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

  const car = cars[i];
  if (!car) return null;
  const src = bigOf(car);
  const point = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };

  return createPortal(
    <div className={`${s.portal} ${heavy.variable}`}>
      <div
        ref={ref}
        className={s.viewer}
        role="dialog"
        aria-modal="true"
        aria-label={`${titleOf(car)} — full screen`}
        style={{ '--g': glowOf(i) } as React.CSSProperties}
      >
        {src && (
          <Image className={s.ambient} src={src} alt="" fill sizes="100vw" aria-hidden="true" />
        )}
        <div
          className={s.canvas}
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
            key={car.id}
            className={s.canvasImg}
            style={{
              ...shapeOf(car),
              transform: `scale(${zoom})`,
              transformOrigin: `${origin.x}% ${origin.y}%`,
            }}
          >
            <span className={s.carBox}>
              {src ? (
                <Image
                  src={src}
                  alt={car.primary_image?.alt || titleOf(car)}
                  fill
                  sizes="100vw"
                  priority
                />
              ) : (
                <CarSilhouette />
              )}
            </span>
          </div>
        </div>

        <div className={s.vTop}>
          <span>
            {i + 1} / {cars.length}
          </span>
          <span className={s.vHint}>
            {zoom > 1 ? 'Drag to look around · click to zoom out' : 'Click or scroll to zoom'}
          </span>
          <button type="button" className={s.vBtn} aria-label="Close" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </div>
        {cars.length > 1 && (
          <>
            <button
              type="button"
              className={`${s.vBtn} ${s.vPrev}`}
              aria-label="Previous car"
              onClick={() => go(i - 1)}
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${s.vBtn} ${s.vNext}`}
              aria-label="Next car"
              onClick={() => go(i + 1)}
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </>
        )}
        <div className={s.vBottom}>
          <div>
            <span>
              {car.location.city} · {car.year} · {shortPrice(car, mode)}
            </span>
            <b>{titleOf(car)}</b>
          </div>
          <Link className={`${s.btn} ${s.primary}`} href={`/cars/${car.slug}?mode=${mode}`}>
            See every detail
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ───────────────────────── the showroom: huge, edge to edge, sliding on its own ───────────────────────── */

function Showroom({
  cars,
  mode,
  onOpen,
  onView,
}: {
  cars: VehicleSummary[];
  mode: Mode;
  onOpen: (i: number) => void;
  onView: (i: number) => void;
}) {
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLElement>(null);
  const touchX = useRef(0);
  const go = useCallback((n: number) => setI((n + cars.length) % cars.length), [cars.length]);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(Boolean(e?.isIntersecting)), {
      threshold: 0.3,
    });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (hold || !visible || cars.length < 2) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => go(i + 1), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [i, hold, visible, go, cars.length]);
  useEffect(() => {
    ref.current?.closest<HTMLElement>('[data-market]')?.style.setProperty('--g', glowOf(i));
  }, [i]);

  const car = cars[i];
  if (!car) return null;
  const buy = mode === 'sale';
  return (
    <section
      ref={ref}
      className={s.hero}
      aria-roledescription="carousel"
      aria-label="Newest cars"
      data-hold={hold || !visible ? '' : undefined}
      style={{ '--g': glowOf(i) } as React.CSSProperties}
      onPointerEnter={() => setHold(true)}
      onPointerLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(i + 1);
        if (e.key === 'ArrowLeft') go(i - 1);
      }}
    >
      <div
        className={s.heroStage}
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? 0;
          setHold(true);
        }}
        onTouchEnd={(e) => {
          const d = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
          if (Math.abs(d) > 50) go(i + (d < 0 ? 1 : -1));
          setHold(false);
        }}
      >
        {cars.map((v, k) => {
          const src = bigOf(v);
          return (
            <div
              key={v.id}
              className={s.slide}
              data-on={k === i ? '' : undefined}
              data-gone={k < i ? '' : undefined}
              aria-hidden={k !== i}
            >
              {src && (
                <Image
                  className={s.ambient}
                  src={src}
                  alt=""
                  fill
                  sizes="100vw"
                  aria-hidden="true"
                />
              )}
              <a
                href={`/cars/${v.slug}?mode=${mode}`}
                className={s.slideCar}
                style={shapeOf(v)}
                tabIndex={k === i ? 0 : -1}
                aria-label={`${titleOf(v)} — view full screen`}
                onClick={(e) => {
                  e.preventDefault();
                  onView(k);
                }}
              >
                <span className={s.carBox}>
                  {src ? (
                    <Image
                      src={src}
                      alt={v.primary_image?.alt || titleOf(v)}
                      fill
                      sizes="100vw"
                      priority={k === 0}
                    />
                  ) : (
                    <CarSilhouette />
                  )}
                </span>
              </a>
            </div>
          );
        })}
      </div>
      <div className={s.heroBar}>
        <div className={s.heroName} aria-live="polite">
          <span>
            {buy ? 'Just arrived' : 'Ready to roll'} · {car.location.city} · {shortPrice(car, mode)}
          </span>
          <h2>
            <Link href={`/cars/${car.slug}?mode=${mode}`}>{titleOf(car)}</Link>
          </h2>
        </div>
        <div className={s.heroActs}>
          <button type="button" className={`${s.btn} ${s.ghost}`} onClick={() => onView(i)}>
            <Maximize2 aria-hidden="true" /> Full screen
          </button>
          <Link
            className={`${s.btn} ${s.primary}`}
            href={`/test-drive?vehicle=${encodeURIComponent(car.id)}`}
          >
            Free demo drive
          </Link>
          <button type="button" className={s.btn} onClick={() => onOpen(i)}>
            Learn more
          </button>
        </div>
      </div>
      <div className={s.thumbs} role="tablist" aria-label="Choose a car">
        {cars.map((v, k) => {
          const src = srcOf(v);
          return (
            <button
              key={v.id}
              type="button"
              role="tab"
              className={s.thumb}
              aria-label={titleOf(v)}
              aria-selected={k === i}
              aria-current={k === i ? 'true' : undefined}
              onClick={() => go(k)}
            >
              {src && <Image src={src} alt="" fill sizes="150px" />}
              <i key={`${i}-${k}`} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ───────────────────────── one tile ───────────────────────── */

function Tile({
  vehicle,
  mode,
  index,
  seen,
  onOpen,
}: {
  vehicle: VehicleSummary;
  mode: Mode;
  index: number;
  seen: boolean;
  onOpen: () => void;
}) {
  const [peek, setPeek] = useState<null | 'left' | 'right'>(null);
  const timer = useRef<number | null>(null);
  const cell = useRef<HTMLDivElement>(null);
  const img = vehicle.primary_image;
  const src = srcOf(vehicle);
  const canHover = () =>
    matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches;

  const clear = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => clear, []);

  return (
    <div
      ref={cell}
      className={s.cell}
      data-seen={seen ? '' : undefined}
      data-peek={peek ? '' : undefined}
      data-tile={index}
      style={{ '--g': glowOf(index), '--i': index % 4 } as React.CSSProperties}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse' || !canHover()) return;
        clear();
        timer.current = window.setTimeout(() => {
          const r = cell.current?.getBoundingClientRect();
          setPeek(r && r.right + 400 > window.innerWidth ? 'left' : 'right');
        }, 260);
      }}
      onPointerLeave={() => {
        clear();
        setPeek(null);
      }}
    >
      <button
        type="button"
        className={s.tile}
        aria-haspopup="dialog"
        aria-label={`${titleOf(vehicle)}, ${shortPrice(vehicle, mode)} — quick look`}
        onClick={() => {
          clear();
          setPeek(null);
          onOpen();
        }}
      >
        <span className={s.pic}>
          {img && src ? (
            <Image
              src={src}
              alt={img.alt || titleOf(vehicle)}
              fill
              sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 100vw"
              {...(img.blur_data_url
                ? { placeholder: 'blur' as const, blurDataURL: img.blur_data_url }
                : {})}
            />
          ) : (
            <CarSilhouette />
          )}
        </span>
        <span className={s.tileText}>
          <b>{titleOf(vehicle)}</b>
          <span>{shortPrice(vehicle, mode)}</span>
        </span>
        <span className={s.tileHint} aria-hidden="true">
          <span>
            <Gauge strokeWidth={2} />
            {nf.format(vehicle.range_km)} km
          </span>
          <span>
            <BatteryCharging strokeWidth={2} />
            {vehicle.battery_kwh} kWh
          </span>
          <span>{vehicle.year}</span>
        </span>
      </button>
      {peek && (
        <div className={s.peek} data-side={peek}>
          <InfoCard vehicle={vehicle} mode={mode} index={index} />
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── the gallery ───────────────────────── */

export function MarketFeed({ vehicles, mode }: { vehicles: VehicleSummary[]; mode: Mode }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState<Set<number>>(() => new Set());
  const [open, setOpen] = useState<number | null>(null);
  const [view, setView] = useState<{ list: VehicleSummary[]; start: number } | null>(null);
  const closeView = useCallback(() => setView(null), []);
  const hero = vehicles.slice(0, Math.min(HERO_COUNT, vehicles.length));
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    const cells = Array.from(gridRef.current?.querySelectorAll<HTMLElement>('[data-tile]') ?? []);
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = Number((e.target as HTMLElement).dataset.tile);
          setSeen((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
        }),
      { threshold: 0.15 },
    );
    cells.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [vehicles.length]);

  const openCar = open !== null ? vehicles[open] : undefined;

  return (
    <>
      {hero.length > 0 && (
        <Showroom
          cars={hero}
          mode={mode}
          onOpen={(i) => setOpen(i)}
          onView={(i) => setView({ list: hero, start: i })}
        />
      )}
      <div className={s.gridHead}>
        <h2>{mode === 'rental' ? 'Cars to rent' : 'Every car'}</h2>
        <span>
          {vehicles.length} {vehicles.length === 1 ? 'car' : 'cars'}
        </span>
      </div>
      <div ref={gridRef} className={s.grid}>
        {vehicles.map((v, i) => (
          <Tile
            key={v.id}
            vehicle={v}
            mode={mode}
            index={i}
            seen={seen.has(i)}
            onOpen={() => setOpen(i)}
          />
        ))}
      </div>
      {openCar && open !== null && (
        <Panel
          vehicle={openCar}
          mode={mode}
          index={open}
          onClose={close}
          onView={() => {
            setView({ list: vehicles, start: open });
            setOpen(null);
          }}
        />
      )}
      {view && <Viewer cars={view.list} start={view.start} mode={mode} onClose={closeView} />}
    </>
  );
}
