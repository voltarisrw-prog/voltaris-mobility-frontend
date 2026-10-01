'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CompareToggleButton } from '@/components/CompareToggleButton';
import { financeDefaults, financePartners } from '@/config/finance';
import { computeLoan, depositFromBps } from '@/lib/finance/amortisation';
import { formatPrice } from '@/lib/format';
import type { VehicleSummary } from '@/types/vehicle';
import s from './market.module.css';

type Mode = 'sale' | 'rental';

/** Each stage glows in one of the company blues, in turn. */
const GLOWS = ['#35a2ff', '#5cc8ff', '#2b6fe0', '#7fd4ff'];

const nf = new Intl.NumberFormat('en-US');

/** Counts up to `target` once `run` is true, then glides between later values. */
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

/* ───────────────────────── one car ───────────────────────── */

function Stage({
  vehicle,
  mode,
  index,
  seen,
}: {
  vehicle: VehicleSummary;
  mode: Mode;
  index: number;
  seen: boolean;
}) {
  const glow = GLOWS[index % GLOWS.length] ?? '#35a2ff';
  const title = `${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}`;
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
  const shown = useCountUp(value ?? 0, seen && value !== null, 500);
  const range = useCountUp(vehicle.range_km, seen, 1400);
  const kwh = useCountUp(vehicle.battery_kwh, seen, 1400, 1);
  const mileage = useCountUp(vehicle.mileage_km, seen, 1400);

  const sliderValue = buy ? months : days;
  const cellsOn = Math.max(1, Math.round((sliderValue / (buy ? 72 : 14)) * 12));
  const isNew = vehicle.condition === 'new' || vehicle.mileage_km < 100;
  const img = vehicle.primary_image;
  const ratio = img && img.width > 0 && img.height > 0 ? `${img.width} / ${img.height}` : '3 / 2';
  const src = img ? (img.detail ?? img.card) : null;

  return (
    <>
      {/* The photo, whole: nothing written on it. */}
      <div className={s.show} style={{ '--ar': ratio } as React.CSSProperties}>
        <Link href={href} className={s.photo} aria-label={`${title} — see the car`}>
          <span className={s.frame}>
            {img && src ? (
              <Image
                src={src}
                alt={img.alt || title}
                fill
                sizes="(min-width: 1100px) 760px, 100vw"
                priority={index === 0}
                {...(img.blur_data_url
                  ? { placeholder: 'blur' as const, blurDataURL: img.blur_data_url }
                  : {})}
              />
            ) : (
              <CarSilhouette />
            )}
          </span>
        </Link>
        {img && src && (
          <div className={s.mirrorWrap} aria-hidden="true">
            <span className={s.mirror}>
              <Image src={src} alt="" fill sizes="(min-width: 1100px) 760px, 100vw" />
            </span>
          </div>
        )}
      </div>

      {/* Everything else, beside it. */}
      <div className={s.info}>
        <div className={s.infoTop}>
          <span className={s.kick}>
            {vehicle.status === 'sold' && <span className={s.sold}>Sold</span>}
            {buy ? 'Just arrived' : 'Ready to roll'} · {vehicle.location.city} · {vehicle.year}
          </span>
          <span className={s.compare}>
            <CompareToggleButton
              vehicleId={vehicle.id}
              mode={mode}
              variant="icon"
              className="rounded-full border-white/25 bg-white/5 text-white hover:border-white"
            />
          </span>
        </div>
        <h2 className={s.name}>
          <Link href={href}>{title}</Link>
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
          <div className={s.slide}>
            <label htmlFor={`r-${vehicle.id}`}>
              <span>{buy ? 'Pay over' : 'Keep it for'}</span>
              <b>{buy ? `${months} months` : `${days} ${days > 1 ? 'days' : 'day'}`}</b>
            </label>
            <div className={s.cells} aria-hidden="true">
              {Array.from({ length: 12 }, (_, k) => (
                <s key={k} data-f={k < cellsOn ? '' : undefined} />
              ))}
            </div>
            <input
              id={`r-${vehicle.id}`}
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
            <RangeFig km={seen ? vehicle.range_km : 0} glow={glow} />
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
              <Link
                className={s.btn}
                href={`/test-drive?vehicle=${encodeURIComponent(vehicle.id)}`}
              >
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
              <Link className={s.btn} href={href}>
                View details <ArrowUpRight aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ───────────────────────── the column ───────────────────────── */

export function MarketFeed({ vehicles, mode }: { vehicles: VehicleSummary[]; mode: Mode }) {
  const feedRef = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState<Set<number>>(() => new Set());
  const [live, setLive] = useState(0);

  // Which stage is on screen: it plays its stories and tints the page.
  useEffect(() => {
    const cards = Array.from(feedRef.current?.querySelectorAll<HTMLElement>('[data-card]') ?? []);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const i = Number((e.target as HTMLElement).dataset.card);
          if (e.isIntersecting) {
            setSeen((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
            if (e.intersectionRatio >= 0.5) setLive(i);
          }
        });
      },
      { threshold: [0.12, 0.5] },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [vehicles.length]);

  // The deck: as the next stage slides over, the one beneath settles back.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const cards = Array.from(feedRef.current?.querySelectorAll<HTMLElement>('[data-card]') ?? []);
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) {
          card.style.setProperty('--cover', '0');
          return;
        }
        const top = parseFloat(getComputedStyle(card).top) || 0;
        const h = card.offsetHeight || 1;
        const p = Math.max(0, Math.min(1, (top + h - next.getBoundingClientRect().top) / h));
        card.style.setProperty('--cover', p.toFixed(3));
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [vehicles.length]);

  // Tint the page with the glow of the car on stage.
  useEffect(() => {
    const market = feedRef.current?.closest<HTMLElement>('[data-market]');
    market?.style.setProperty('--g', GLOWS[live % GLOWS.length] ?? '#35a2ff');
  }, [live]);

  return (
    <div ref={feedRef} className={s.feed}>
      {vehicles.map((vehicle, i) => (
        <article
          key={vehicle.id}
          data-card={i}
          className={s.card}
          style={{ '--g': GLOWS[i % GLOWS.length] } as React.CSSProperties}
          data-seen={seen.has(i) ? '' : undefined}
          data-live={live === i ? '' : undefined}
          aria-label={`${vehicle.make} ${vehicle.model}`}
        >
          <Stage vehicle={vehicle} mode={mode} index={i} seen={seen.has(i)} />
        </article>
      ))}
    </div>
  );
}
