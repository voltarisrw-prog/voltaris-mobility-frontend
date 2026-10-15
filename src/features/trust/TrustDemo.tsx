'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, FileCheck2, Landmark, BatteryCharging, ScanSearch, ShieldCheck, type LucideIcon } from 'lucide-react';

const ICONS: LucideIcon[] = [FileCheck2, Landmark, BatteryCharging, ScanSearch];
const R = 33;
const C = 2 * Math.PI * R;

/**
 * A small, honest explainer: the mark is earned only when every check is complete.
 * The check names come from the content file; the car is labelled as an example.
 */
export function TrustDemo({ checks }: { checks: { title: string }[] }) {
  const n = checks.length;
  const [on, setOn] = useState<boolean[]>(() => checks.map(() => false));
  const touched = useRef(false);
  const played = useRef(false);
  const box = useRef<HTMLElement>(null);
  const SEG = C / Math.max(n, 1);

  // Plays once when it scrolls into view, unless the visitor has already tapped something.
  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting || played.current) return;
        played.current = true;
        for (let i = 0; i < n; i += 1) {
          timers.push(
            setTimeout(() => {
              if (!touched.current) setOn((cur) => cur.map((v, k) => (k === i ? true : v)));
            }, 700 + i * 750),
          );
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [n]);

  const done = on.filter(Boolean).length;
  const ok = done === n && n > 0;
  const outstanding = checks.filter((_, i) => !on[i]).map((c) => c.title);

  return (
    <aside ref={box} className={`tr-demo${ok ? ' is-ok' : ''}`} aria-label="How the verified mark is earned">
      <div className="tr-dh">
        <small>How the mark is earned</small>
        <span className="tr-pill">
          <i />
          {ok ? 'Verified' : 'Not verified yet'}
        </span>
      </div>

      <div className="tr-car">
        <svg viewBox="0 0 600 200" aria-hidden="true">
          <path d="M30 140C34 112 54 98 92 92L172 56C214 36 320 30 396 40C440 46 470 60 500 82L548 92C572 98 580 116 580 140V150H30Z" fill="#cdd5ea" />
          <path d="M196 62C250 44 340 44 392 54L440 92H170Z" fill="#0b1226" opacity=".9" />
          <circle cx="150" cy="152" r="32" fill="#04060d" />
          <circle cx="462" cy="152" r="32" fill="#04060d" />
        </svg>
        <Image src="/demo/vehicles/taycan-white.jpg" alt="" fill sizes="(min-width: 980px) 40vw, 90vw" className="object-cover" />
        <div className="tr-seal">
          <svg className="tr-rg" viewBox="0 0 76 76" aria-hidden="true">
            <circle className="tr-tr" cx="38" cy="38" r={R} />
            {checks.map((c, i) => (
              <circle
                key={c.title}
                cx="38"
                cy="38"
                r={R}
                stroke="#12d6b0"
                style={{
                  strokeDasharray: on[i] ? `${SEG - 6} ${C}` : `0 ${C}`,
                  strokeDashoffset: -(i * SEG),
                  strokeOpacity: on[i] ? 1 : 0,
                }}
              />
            ))}
          </svg>
          <span className="tr-in">
            {ok ? <Check size={26} strokeWidth={3} /> : <b>{done}/{n}</b>}
          </span>
        </div>
      </div>

      <p className="tr-dt">Example listing</p>
      <div className="tr-rows">
        {checks.map((c, i) => {
          const Icon = ICONS[i] ?? ShieldCheck;
          return (
            <button
              key={c.title}
              type="button"
              className={`tr-row${on[i] ? ' is-on' : ''}`}
              aria-pressed={on[i]}
              onClick={() => {
                touched.current = true;
                setOn((cur) => cur.map((v, k) => (k === i ? !v : v)));
              }}
            >
              <span className="tr-ic">
                <Icon size={20} strokeWidth={1.8} />
              </span>
              <b>{c.title}</b>
              <span className="tr-st">
                <Check size={14} strokeWidth={3} />
              </span>
            </button>
          );
        })}
      </div>
      <p className="tr-dn" aria-live="polite">
        {ok ? (
          <>
            <b>All four checks completed.</b> Nothing less earns the mark.
          </>
        ) : done === 0 ? (
          'Tap a check to complete it. The mark needs all four.'
        ) : (
          <>
            <b>Outstanding:</b> {outstanding.join(', ')}.
          </>
        )}
      </p>
    </aside>
  );
}
