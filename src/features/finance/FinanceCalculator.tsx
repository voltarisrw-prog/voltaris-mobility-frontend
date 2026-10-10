'use client';

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { financeDefaults, financePartners, type FinancePartner } from '@/config/finance';
import { bpsFromDeposit, computeLoan, depositFromBps } from '@/lib/finance/amortisation';
import { formatPrice, cn } from '@/lib/format';
import { FinanceApplyForm } from './FinanceApplyForm';
import './finance.css';

/**
 * Live credit calculator. Everything recomputes on every input change; the
 * arithmetic is integer-only (see lib/finance/amortisation). The numbers shown
 * are indicative — the partner bank sets the real rate at approval, and the
 * page says so.
 */

const RING = 2 * Math.PI * 84;
const SEG_COLORS = ['#e6ebf7', '#3d9bff', '#12d6b0'];
const MAX_DEPOSIT_BPS = 8000;

function fmtBps(bps: number) {
  return `${(bps / 100).toFixed(2).replace(/\.?0+$/, '')}%`;
}

function parseRwf(raw: string): number {
  const digits = raw.replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

/** Eases a displayed number towards its target so the figures roll instead of jump. */
function useTween(target: number, ms = 550) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min((t - start) / ms, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const cur = a + (target - a) * e;
      from.current = cur;
      setValue(cur);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

/** Remaining balance after each monthly payment (visual only). */
function balances(financed: number, monthly: number, rateBps: number, months: number) {
  const r = rateBps / 120000;
  const out: number[] = [];
  for (let k = 0; k <= months; k++) {
    const b = r ? financed * Math.pow(1 + r, k) - (monthly * (Math.pow(1 + r, k) - 1)) / r : financed - monthly * k;
    out.push(Math.max(b, 0));
  }
  return out;
}

export function FinanceCalculator({
  initialPrice,
  vehicleLabel,
  vehicleSlug,
}: {
  initialPrice: number;
  vehicleLabel?: string;
  vehicleSlug?: string;
}) {
  const ids = { price: useId(), deposit: useId(), term: useId(), rate: useId() };
  const [price, setPrice] = useState(initialPrice);
  const [depositMode, setDepositMode] = useState<'pct' | 'rwf'>('pct');
  const [depositBps, setDepositBps] = useState<number>(financeDefaults.depositBps);
  const [depositRwf, setDepositRwf] = useState<number>(depositFromBps(initialPrice, financeDefaults.depositBps));
  const [term, setTerm] = useState<number>(financeDefaults.termMonths);
  const [partnerId, setPartnerId] = useState<string>(financePartners[0]!.id);
  const [rateBps, setRateBps] = useState<number>(financePartners[0]!.annualRateBps);
  const [rateText, setRateText] = useState<string>(String(financePartners[0]!.annualRateBps / 100));
  const [applyTo, setApplyTo] = useState<FinancePartner | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [hoverK, setHoverK] = useState<number | null>(null);
  const [mbOn, setMbOn] = useState(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resRef = useRef<HTMLDivElement>(null);
  const applyRef = useRef<HTMLElement>(null);

  const effectiveDeposit = depositMode === 'pct' ? depositFromBps(price, depositBps) : Math.min(depositRwf, price);
  const effectiveBps = depositMode === 'pct' ? depositBps : bpsFromDeposit(price, effectiveDeposit);

  const loan = useMemo(
    () => computeLoan({ priceRwf: price, depositRwf: effectiveDeposit, annualRateBps: rateBps, termMonths: term }),
    [price, effectiveDeposit, rateBps, term],
  );

  const perPartner = useMemo(
    () =>
      financePartners.map((partner) => {
        const t = Math.min(Math.max(term, partner.minTermMonths), partner.maxTermMonths);
        const dep = Math.max(effectiveDeposit, depositFromBps(price, partner.minDepositBps));
        return {
          partner,
          loan: computeLoan({ priceRwf: price, depositRwf: dep, annualRateBps: partner.annualRateBps, termMonths: t }),
          term: t,
          raised: dep > effectiveDeposit,
        };
      }),
    [price, effectiveDeposit, term],
  );
  const lowest = Math.min(...perPartner.map((p) => p.loan.monthlyRwf));

  // Keep the typed rate in step with chip clicks without fighting a half-typed "16."
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRateText((t) => (Math.round(parseFloat(t || '0') * 100) === rateBps ? t : String(rateBps / 100)));
  }, [rateBps]);

  // The floating bar shows while the result card is off screen and the form is not in view.
  useEffect(() => {
    const v = { r: true, a: false };
    const upd = () => setMbOn(!v.r && !v.a);
    const o1 = new IntersectionObserver(([e]) => {
      v.r = Boolean(e?.isIntersecting);
      upd();
    });
    const o2 = new IntersectionObserver(([e]) => {
      v.a = Boolean(e?.isIntersecting);
      upd();
    });
    if (resRef.current) o1.observe(resRef.current);
    if (applyRef.current) o2.observe(applyRef.current);
    return () => {
      o1.disconnect();
      o2.disconnect();
    };
  }, []);

  function flash(message: string) {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 4800);
  }

  function choosePartner(partner: FinancePartner) {
    setPartnerId(partner.id);
    setRateBps(partner.annualRateBps);
    const parts: string[] = [];
    const need = depositFromBps(price, partner.minDepositBps);
    if (effectiveDeposit < need) {
      if (depositMode === 'pct') setDepositBps(partner.minDepositBps);
      else setDepositRwf(need);
      parts.push(`a deposit of at least ${fmtBps(partner.minDepositBps)}`);
    }
    if (term > partner.maxTermMonths) {
      setTerm(partner.maxTermMonths);
      parts.push(`a term of up to ${partner.maxTermMonths} months`);
    }
    if (parts.length) flash(`${partner.name} needs ${parts.join(' and ')}, so we adjusted it.`);
  }

  const goApply = () =>
    requestAnimationFrame(() =>
      document.getElementById('finance-apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );

  const summaryLines = [
    vehicleLabel ? `Vehicle: ${vehicleLabel}${vehicleSlug ? ` (${vehicleSlug})` : ''}` : null,
    `Price: ${formatPrice(price)}`,
    `Deposit: ${formatPrice(effectiveDeposit)} (${fmtBps(effectiveBps)})`,
    `Financed: ${formatPrice(loan.financedRwf)} over ${term} months at ${fmtBps(rateBps)} p.a.`,
    `Indicative monthly payment: ${formatPrice(loan.monthlyRwf)}`,
    `Total cost of credit: ${formatPrice(loan.totalInterestRwf)}`,
  ].filter((l): l is string => Boolean(l));

  // ---- derived visuals
  const monthlyShown = useTween(loan.monthlyRwf);
  const shares = [loan.shareBps.deposit, loan.shareBps.financed, loan.shareBps.interest];
  const segs = shares.reduce<{ len: number; off: number }[]>((acc, s, i) => {
    const prev = shares.slice(0, i).reduce((a, b) => a + b, 0);
    acc.push({ len: Math.max((s / 10000) * RING - 7, 0), off: -(prev / 10000) * RING });
    return acc;
  }, []);

  const W = 320;
  const H = 84;
  const series = useMemo(() => balances(loan.financedRwf, loan.monthlyRwf, rateBps, term), [loan.financedRwf, loan.monthlyRwf, rateBps, term]);
  const X = (k: number) => (k / term) * W;
  const Y = (b: number) => H - 6 - (b / (loan.financedRwf || 1)) * (H - 12);
  const line = 'M' + series.map((b, k) => `${X(k).toFixed(1)} ${Y(b).toFixed(1)}`).join('L');
  const hoverBal = hoverK !== null ? series[hoverK] : undefined;

  const depPct = (Math.min(effectiveBps, MAX_DEPOSIT_BPS) / MAX_DEPOSIT_BPS) * 100;
  const termPct = ((term - financeDefaults.minTermMonths) / (financeDefaults.maxTermMonths - financeDefaults.minTermMonths)) * 100;
  const isChip = (p: FinancePartner) => partnerId === p.id && rateBps === p.annualRateBps;

  return (
    <>
      <div className="fc-cg">
        {/* ------------------------------------------------------------ Inputs */}
        <section className="fc-card fc-ctls" aria-label="Finance calculator">
          <div>
            <label htmlFor={ids.price} className="fc-cl">
              Vehicle price
            </label>
            <div className="fc-pin">
              <span>RWF</span>
              <input
                id={ids.price}
                inputMode="numeric"
                value={price.toLocaleString('en-RW')}
                onChange={(e) => {
                  const next = parseRwf(e.target.value);
                  setPrice(next);
                  if (depositMode === 'rwf') setDepositRwf((d) => Math.min(d, next));
                }}
              />
            </div>
            {vehicleLabel && <p className="fc-veh">{vehicleLabel}</p>}
          </div>

          <div>
            <div className="fc-ch">
              <label htmlFor={ids.deposit} className="fc-cl">
                Deposit
              </label>
              <div className="fc-ctrl">
                <div className="fc-mini">
                  <input
                    aria-label={depositMode === 'pct' ? 'Deposit percentage' : 'Deposit in RWF'}
                    inputMode="numeric"
                    value={depositMode === 'pct' ? String(Math.round(depositBps / 100)) : depositRwf.toLocaleString('en-RW')}
                    onChange={(e) => {
                      const n = parseRwf(e.target.value);
                      if (depositMode === 'pct') setDepositBps(Math.min(n * 100, MAX_DEPOSIT_BPS));
                      else setDepositRwf(Math.min(n, price));
                    }}
                  />
                  <span>{depositMode === 'pct' ? '%' : 'RWF'}</span>
                </div>
                <div role="group" aria-label="Deposit unit" className="fc-seg">
                  {(['pct', 'rwf'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={depositMode === m}
                      className={depositMode === m ? 'is-on' : ''}
                      onClick={() => {
                        if (m === 'rwf') setDepositRwf(effectiveDeposit);
                        else setDepositBps(Math.min(effectiveBps, MAX_DEPOSIT_BPS));
                        setDepositMode(m);
                      }}
                    >
                      {m === 'pct' ? '%' : 'RWF'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <input
              id={ids.deposit}
              type="range"
              className="fc-range"
              min={0}
              max={MAX_DEPOSIT_BPS}
              step={100}
              value={Math.min(effectiveBps, MAX_DEPOSIT_BPS)}
              style={{ '--p': `${depPct}%` } as CSSProperties}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (depositMode === 'pct') setDepositBps(v);
                else setDepositRwf(depositFromBps(price, v));
              }}
              aria-valuetext={`${fmtBps(effectiveBps)}, ${formatPrice(effectiveDeposit)}`}
            />
            <div className="fc-cv">
              <b>{fmtBps(effectiveBps)}</b>
              <span>{formatPrice(effectiveDeposit)}</span>
            </div>
            <p className={cn('fc-warn', notice && 'is-on')} role="status">
              {notice}
            </p>
          </div>

          <div>
            <div className="fc-ch">
              <label htmlFor={ids.term} className="fc-cl">
                Term
              </label>
            </div>
            <input
              id={ids.term}
              type="range"
              className="fc-range"
              min={financeDefaults.minTermMonths}
              max={financeDefaults.maxTermMonths}
              step={6}
              value={term}
              style={{ '--p': `${termPct}%` } as CSSProperties}
              onChange={(e) => setTerm(Number(e.target.value))}
              aria-valuetext={`${term} months`}
            />
            <div className="fc-cv">
              <b>{term} months</b>
              <span>{(term / 12).toFixed(1).replace('.0', '')} years</span>
            </div>
          </div>

          <div>
            <div className="fc-ch">
              <label htmlFor={ids.rate} className="fc-cl">
                Annual interest rate
              </label>
            </div>
            <div className="fc-chips">
              {financePartners.map((partner) => (
                <button
                  key={partner.id}
                  type="button"
                  aria-pressed={isChip(partner)}
                  className={cn('fc-rc', isChip(partner) && 'is-on')}
                  onClick={() => choosePartner(partner)}
                >
                  {partner.shortName.toUpperCase()}
                  <small>{fmtBps(partner.annualRateBps)}</small>
                </button>
              ))}
            </div>
            <div className="fc-rt">
              <div className="fc-mini">
                <input
                  id={ids.rate}
                  inputMode="decimal"
                  value={rateText}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setRateText(raw);
                    const v = Math.round(parseFloat(raw || '0') * 100);
                    setRateBps(Number.isFinite(v) && v >= 0 ? Math.min(v, 6000) : 0);
                  }}
                />
                <span>%</span>
              </div>
              <span>per year — edit to match your offer</span>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ Output */}
        <aside className="fc-card fc-res" ref={resRef} aria-label="Your result">
          <p className="fc-rk">Indicative monthly payment</p>
          <p className="sr-only" aria-live="polite">
            {formatPrice(loan.monthlyRwf)} for {term} months at {fmtBps(rateBps)} per year
          </p>
          <div className="fc-ring">
            <svg viewBox="0 0 200 200" aria-hidden="true">
              <circle className="tr" cx="100" cy="100" r="84" />
              {segs.map((s, i) => (
                <circle
                  key={i}
                  cx="100"
                  cy="100"
                  r="84"
                  stroke={SEG_COLORS[i]}
                  style={{ strokeDasharray: `${s.len} ${RING - s.len}`, strokeDashoffset: s.off }}
                />
              ))}
            </svg>
            <div className="fc-mid" aria-hidden="true">
              <small>RF</small>
              <b>{Math.round(monthlyShown).toLocaleString('en-US')}</b>
              <em>
                for {term} months at {fmtBps(rateBps)} p.a.
              </em>
            </div>
          </div>
          <dl className="fc-lg">
            {(
              [
                ['Deposit', loan.depositRwf],
                ['Financed', loan.financedRwf],
                ['Interest', loan.totalInterestRwf],
              ] as const
            ).map(([label, value], i) => (
              <div key={label}>
                <dt>
                  <i style={{ background: SEG_COLORS[i] }} />
                  {label}
                </dt>
                <dd>{formatPrice(value)}</dd>
              </div>
            ))}
          </dl>
          <dl className="fc-rows">
            {(
              [
                ['Total repayable', loan.totalRepayableRwf],
                ['Total cost of credit', loan.totalInterestRwf],
                ['Total you pay (deposit + repayments)', loan.totalCostRwf],
              ] as const
            ).map(([label, value], i) => (
              <div key={label} className={cn('fc-rw', i === 2 && 'is-big')}>
                <dt>{label}</dt>
                <dd>{formatPrice(value)}</dd>
              </div>
            ))}
          </dl>
          <div className="fc-sk">
            <small>Balance remaining</small>
            <span className="fc-tp">{hoverK !== null && hoverBal !== undefined ? `Month ${hoverK} · ${formatPrice(hoverBal)}` : ''}</span>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              aria-hidden="true"
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setHoverK(Math.min(term, Math.max(0, Math.round(((e.clientX - r.left) / r.width) * term))));
              }}
              onPointerLeave={() => setHoverK(null)}
            >
              <defs>
                <linearGradient id="fc-sa" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#5CC8FF" stopOpacity=".4" />
                  <stop offset="1" stopColor="#5CC8FF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${line}L${W} ${H}L0 ${H}Z`} fill="url(#fc-sa)" />
              <path d={line} className="ln" />
              {hoverK !== null && hoverBal !== undefined && <circle cx={X(hoverK)} cy={Y(hoverBal)} r="4.5" fill="#fff" />}
            </svg>
          </div>
          <p className="fc-note">
            Indicative only. The lender sets the final rate, fees and insurance at approval. No
            arrangement fee is charged by Voltaris.
          </p>
          <button type="button" className="fc-btn fc-send" onClick={goApply}>
            Send to an advisor <ArrowRight size={18} />
          </button>
        </aside>
      </div>

      {/* ------------------------------------------------------------ Partners */}
      <section className="fc-pt" aria-labelledby="partners-heading">
        <p className="fc-eb">Finance partners</p>
        <h2 id="partners-heading" className="fc-sh">
          Same car, three ways to pay <em>for it.</em>
        </h2>
        <ul className="fc-pgrid">
          {perPartner.map(({ partner, loan: pl, term: pt, raised }) => (
            <li key={partner.id} className={cn('fc-pc', isChip(partner) && 'is-on', pl.monthlyRwf === lowest && 'is-lo')}>
              <span className="fc-best">Lowest monthly</span>
              <div className="fc-ph2">
                <h3>{partner.name}</h3>
                <span className="fc-rate">{fmtBps(partner.annualRateBps)} p.a.</span>
              </div>
              <p className="fc-mo">
                {formatPrice(pl.monthlyRwf)}
                <small>/ mo</small>
              </p>
              <p className="fc-mt">
                {pt} months · min. deposit {fmtBps(partner.minDepositBps)}
              </p>
              <p className="fc-pn">{partner.note}</p>
              {(raised || pt !== term) && (
                <p className="fc-mn">
                  Calculated with {raised ? `the lender’s ${fmtBps(partner.minDepositBps)} minimum deposit` : ''}
                  {raised && pt !== term ? ' and ' : ''}
                  {pt !== term ? `a ${pt}-month term (the lender’s limit)` : ''}.
                </p>
              )}
              <button type="button" className="fc-use" onClick={() => choosePartner(partner)}>
                Use this rate
              </button>
              <button
                type="button"
                className="fc-apbtn"
                onClick={() => {
                  choosePartner(partner);
                  setApplyTo(partner);
                  goApply();
                }}
              >
                Apply through Voltaris
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------------ Apply */}
      <section id="finance-apply" ref={applyRef} className="fc-ap" aria-labelledby="apply-heading">
        <div>
          <p className="fc-eb">Apply</p>
          <h2 id="apply-heading" className="fc-sh">
            {applyTo ? (
              <>
                Apply with <em>{applyTo.name}</em>
              </>
            ) : (
              <>
                Send these numbers to <em>an advisor</em>
              </>
            )}
          </h2>
          <p className="fc-lead fc-ap-lead">
            Your figures are attached below. An advisor confirms the vehicle, checks the deposit and
            term against the lender&rsquo;s rules, and walks the application in with you. One
            application, no repeated paperwork.
          </p>
          <div className="fc-fig">
            {summaryLines.map((line) => {
              const i = line.indexOf(': ');
              return (
                <div key={line}>
                  <span>{line.slice(0, i)}</span>
                  <b>{line.slice(i + 2)}</b>
                </div>
              );
            })}
          </div>
        </div>
        <div className="fc-card fc-apply">
          <FinanceApplyForm
            key={`${applyTo?.id ?? 'none'}-${loan.monthlyRwf}`}
            source={`finance-${applyTo?.id ?? 'general'}`}
            summary={[applyTo ? `Lender: ${applyTo.name}` : null, ...summaryLines].filter(Boolean).join('\n')}
          />
        </div>
      </section>

      <div className={cn('fc-mb', mbOn && 'is-on')}>
        <div>
          <small>Indicative monthly payment</small>
          <b>{formatPrice(loan.monthlyRwf)}</b>
        </div>
        <button type="button" className="fc-btn" onClick={goApply}>
          Send
        </button>
      </div>
    </>
  );
}
