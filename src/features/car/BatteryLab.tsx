'use client';

import { useId, useState } from 'react';
import { BatteryCharging, Clock3, PlugZap } from 'lucide-react';
import { chargeFrom10, duration, num } from './model';
import c from './car.module.css';

/**
 * Try the battery: drag how full to charge and watch the range ring fill,
 * with the time on a fast charger and the energy it adds.
 */
export function BatteryLab({
  rangeKm,
  batteryKwh,
  charging,
}: {
  rangeKm: number;
  batteryKwh: number;
  charging: {
    ac_kw: number;
    dc_kw: number | null;
    port_type: string;
    dc_10_80_minutes: number | null;
  };
}) {
  const [to, setTo] = useState(80);
  const id = useId();
  const r = chargeFrom10({ range_km: rangeKm, battery_kwh: batteryKwh, charging }, to);
  const R = 84;
  const C = 2 * Math.PI * R;
  const arc = 0.78; // the ring is open at the bottom, like a gauge
  const fill = (to / 100) * arc;

  return (
    <section className={`${c.slab} ${c.lab}`} aria-labelledby={`${id}-h`}>
      <div className={c.slabHead}>
        <h2 id={`${id}-h`} className={c.h2}>
          Try the battery
        </h2>
        <p className={c.lede}>Drag to choose how full.</p>
      </div>

      <div className={c.labGrid}>
        <div className={c.ring} style={{ '--p': to } as React.CSSProperties}>
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <linearGradient id={`${id}-g`} x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#1c3fb8" />
                <stop offset="0.55" stopColor="#35a2ff" />
                <stop offset="1" stopColor="#7fd4ff" />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r={R}
              className={c.ringTrack}
              strokeDasharray={`${C * arc} ${C}`}
              transform="rotate(130 100 100)"
            />
            <circle
              cx="100"
              cy="100"
              r={R}
              className={c.ringFill}
              stroke={`url(#${id}-g)`}
              strokeDasharray={`${C * fill} ${C}`}
              transform="rotate(130 100 100)"
            />
          </svg>
          <div className={c.ringText} aria-live="polite">
            <b>{num(r.km)}</b>
            <span>km of range</span>
          </div>
        </div>

        <div className={c.labSide}>
          <label className={c.sliderLabel} htmlFor={`${id}-r`}>
            <span>Charge to</span>
            <b>{to}%</b>
          </label>
          <input
            id={`${id}-r`}
            type="range"
            min={20}
            max={100}
            step={5}
            value={to}
            onChange={(e) => setTo(Number(e.target.value))}
            className={c.slider}
            style={{ '--fill': `${((to - 20) / 80) * 100}%` } as React.CSSProperties}
          />
          <div className={c.labStats}>
            <div>
              <Clock3 aria-hidden="true" />
              <b>{duration(r.minutes)}</b>
              <span>
                from 10% on {r.kw} kW {r.dc ? 'DC' : 'AC'}
              </span>
            </div>
            <div>
              <BatteryCharging aria-hidden="true" />
              <b>{num(r.kwh)} kWh</b>
              <span>added to the {batteryKwh} kWh pack</span>
            </div>
            <div>
              <PlugZap aria-hidden="true" />
              <b>{charging.port_type}</b>
              <span>charge port</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
