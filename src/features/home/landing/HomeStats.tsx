'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  Car,
  KeyRound,
  LayoutGrid,
  MapPin,
  Pause,
  Play,
  Settings,
  ShoppingBag,
  Tag,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import s from './home.module.css';
import st from './stats.module.css';
import { words } from './text';

export interface StatItem {
  key: string;
  label: string;
  value: number;
  note?: string | undefined;
}

const ICONS: Record<string, LucideIcon> = {
  sold: ShoppingBag,
  rented: KeyRound,
  testdrives: CalendarCheck,
  partners: Building2,
  trusted: Users,
  listed: Car,
  brands: Tag,
  dealers: BadgeCheck,
  garages: Wrench,
  locations: MapPin,
  bodies: LayoutGrid,
  services: Settings,
};

const fmt = (n: number) => n.toLocaleString('en-US');

/**
 * A count is shown as one less than the real figure with a plus ("5" reads "4+"),
 * which is always true. A count of 1 is shown as it is, because "0+" would not be.
 */
const floor = (v: number) => (v > 1 ? { shown: v - 1, plus: true } : { shown: v, plus: false });

/** One card. Its figure counts up from zero the first time the card slides into view. */
function Card({ item, index, clone }: { item: StatItem; index: number; clone: boolean }) {
  const { shown, plus } = floor(item.value);
  const Icon = ICONS[item.key] ?? Car;
  const box = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(shown);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        setOn(true);
        if (reduce) return;
        const duration = 1900;
        let t0 = 0;
        const step = (t: number) => {
          if (!t0) t0 = t;
          const p = Math.min((t - t0) / duration, 1);
          setN(Math.round(shown * (p === 1 ? 1 : 1 - Math.pow(2, -10 * p))));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.55 },
    );
    // Start from zero only when it will animate; with reduced motion the real number just shows.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!reduce) setN(0);
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [shown]);

  return (
    <div
      ref={box}
      className={st.card}
      data-on={on ? '' : undefined}
      data-clone={clone ? '' : undefined}
      aria-hidden={clone ? true : undefined}
    >
      {!clone && (
        <span className={st.sr}>
          {fmt(shown)}
          {plus ? '+' : ''} {item.label}
        </span>
      )}
      <div className={st.top} aria-hidden="true">
        <span className={st.ico}>
          <Icon size={20} strokeWidth={1.8} />
        </span>
        <span className={st.idx}>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className={st.fig} aria-hidden="true">
        <b className={st.num}>{fmt(n)}</b>
        {plus && <i className={st.plus}>+</i>}
      </div>
      <span className={st.label} aria-hidden="true">
        {item.label}
      </span>
      {item.note && (
        <small className={st.note} aria-hidden="true">
          {item.note}
        </small>
      )}
    </div>
  );
}

export function HomeStats({ eyebrow, items }: { eyebrow: string; items: StatItem[] }) {
  const [paused, setPaused] = useState(false);
  // Enough copies that the row always fills the screen and loops without a gap.
  const copies = Math.max(2, Math.ceil(8.1 / Math.max(items.length, 1)) + 1);
  const seconds = Math.max(24, items.length * 5);

  return (
    <section className={st.sec} id="numbers" aria-labelledby="numbers-h">
      <div className={st.bg} aria-hidden="true" />
      <div className={s.w}>
        <div className={st.head}>
          <span className={`${s.eb} ${s.rv}`}>{eyebrow}</span>
          <h2 id="numbers-h" className={`${s.h2} ${s.rv} ${s.sp}`} data-wide="">
            {words(
              <>
                Voltaris in <em className={s.ser}>numbers</em>
              </>,
            )}
          </h2>
        </div>
      </div>

      <div className={st.viewport}>
        <div
          className={st.track}
          data-paused={paused ? '' : undefined}
          style={{ '--copies': copies, '--dur': `${seconds}s` } as CSSProperties}
        >
          {Array.from({ length: copies }, (_, c) =>
            items.map((item, i) => (
              <Card key={`${c}-${item.key}`} item={item} index={i} clone={c > 0} />
            )),
          )}
        </div>
      </div>

      <div className={st.tools}>
        <button
          type="button"
          className={st.pause}
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
          {paused ? 'Play' : 'Pause'}
        </button>
      </div>
    </section>
  );
}
