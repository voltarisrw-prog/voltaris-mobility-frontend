'use client';

import { useId, useMemo, useState } from 'react';
import { financeDefaults, financePartners, type FinancePartner } from '@/config/finance';
import { bpsFromDeposit, computeLoan, depositFromBps } from '@/lib/finance/amortisation';
import { cn } from '@/lib/format';
import { FinanceApplyForm } from './FinanceApplyForm';
import { Reveal } from '@/components/motion/Reveal';


/**
 * Live credit calculator. Everything recomputes on every input change; the
 * arithmetic is integer-only (see lib/finance/amortisation). The numbers shown
 * are indicative — the partner bank sets the real rate at approval, and the
 * page says so.
 */

/** Fixed locale so server and browser always print the same "RWF 45,000,000". */
const formatPrice = (n: number) => `RWF ${Math.round(n).toLocaleString('en-US')}`;

function fmtBps(bps: number) {
  return `${(bps / 100).toFixed(2).replace(/\.?0+$/, '')}%`;
}

function parseRwf(raw: string): number {
  const digits = raw.replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
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
  const [applyTo, setApplyTo] = useState<FinancePartner | null>(null);

  const effectiveDeposit = depositMode === 'pct' ? depositFromBps(price, depositBps) : Math.min(depositRwf, price);
  const effectiveBps = depositMode === 'pct' ? depositBps : bpsFromDeposit(price, effectiveDeposit);

  const loan = useMemo(
    () => computeLoan({ priceRwf: price, depositRwf: effectiveDeposit, annualRateBps: rateBps, termMonths: term }),
    [price, effectiveDeposit, rateBps, term],
  );

  const perPartner = useMemo(
    () =>
      financePartners.map((partner) => ({
        partner,
        loan: computeLoan({
          priceRwf: price,
          depositRwf: Math.max(effectiveDeposit, depositFromBps(price, partner.minDepositBps)),
          annualRateBps: partner.annualRateBps,
          termMonths: Math.min(Math.max(term, partner.minTermMonths), partner.maxTermMonths),
        }),
        term: Math.min(Math.max(term, partner.minTermMonths), partner.maxTermMonths),
      })),
    [price, effectiveDeposit, term],
  );

  function choosePartner(partner: FinancePartner) {
    setPartnerId(partner.id);
    setRateBps(partner.annualRateBps);
  }

  const summaryLines = [
    vehicleLabel ? `Vehicle: ${vehicleLabel}${vehicleSlug ? ` (${vehicleSlug})` : ''}` : null,
    `Price: ${formatPrice(price)}`,
    `Deposit: ${formatPrice(effectiveDeposit)} (${fmtBps(effectiveBps)})`,
    `Financed: ${formatPrice(loan.financedRwf)} over ${term} months at ${fmtBps(rateBps)} p.a.`,
    `Indicative monthly payment: ${formatPrice(loan.monthlyRwf)}`,
    `Total cost of credit: ${formatPrice(loan.totalInterestRwf)}`,
  ].filter(Boolean);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
      <div className="fw-pay-bar">
        <div>
          <span>Monthly payment</span>
          <b>{formatPrice(loan.monthlyRwf)}</b>
        </div>
        <a href="#finance-apply">Apply</a>
      </div>
      {/* ------------------------------------------------------------ Inputs */}
      <div className="space-y-8">
        <div>
          <label htmlFor={ids.price} className="eyebrow">
            Vehicle price
          </label>
          <div className="mt-2 flex items-baseline gap-2 border-b border-hairline pb-2 focus-within:border-chrome">
            <span className="font-data text-sm text-steel-muted">RWF</span>
            <input
              id={ids.price}
              inputMode="numeric"
              value={price.toLocaleString('en-RW')}
              onChange={(e) => {
                const next = parseRwf(e.target.value);
                setPrice(next);
                if (depositMode === 'rwf') setDepositRwf((d) => Math.min(d, next));
              }}
              className="w-full bg-transparent font-display text-2xl tabular-nums text-chrome outline-none"
            />
          </div>
          {vehicleLabel && <p className="mt-2 text-xs text-steel-muted">{vehicleLabel}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor={ids.deposit} className="eyebrow">
              Deposit
            </label>
            <div role="group" aria-label="Deposit unit" className="inline-flex border border-hairline">
              {(['pct', 'rwf'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={depositMode === m}
                  onClick={() => {
                    if (m === 'rwf') setDepositRwf(effectiveDeposit);
                    else setDepositBps(effectiveBps);
                    setDepositMode(m);
                  }}
                  className={cn(
                    'min-h-9 px-3 font-data text-xs uppercase tracking-[0.1em]',
                    depositMode === m ? 'bg-chrome text-surface' : 'text-steel hover:text-chrome',
                  )}
                >
                  {m === 'pct' ? '%' : 'RWF'}
                </button>
              ))}
            </div>
          </div>
          {depositMode === 'pct' ? (
            <>
              <input
                id={ids.deposit}
                type="range"
                min={0}
                max={8000}
                step={100}
                value={depositBps}
                onChange={(e) => setDepositBps(Number(e.target.value))}
                aria-valuetext={`${fmtBps(depositBps)}, ${formatPrice(effectiveDeposit)}`}
                className="voltaris-range mt-4 w-full"
              />
              <div className="mt-2 flex justify-between font-data text-sm tabular-nums">
                <span className="text-chrome">{fmtBps(depositBps)}</span>
                <span className="text-steel">{formatPrice(effectiveDeposit)}</span>
              </div>
            </>
          ) : (
            <div className="mt-3 flex items-baseline gap-2 border-b border-hairline pb-2 focus-within:border-chrome">
              <span className="font-data text-sm text-steel-muted">RWF</span>
              <input
                id={ids.deposit}
                inputMode="numeric"
                value={depositRwf.toLocaleString('en-RW')}
                onChange={(e) => setDepositRwf(Math.min(parseRwf(e.target.value), price))}
                className="w-full bg-transparent font-display text-xl tabular-nums text-chrome outline-none"
              />
              <span className="font-data text-sm text-steel">{fmtBps(effectiveBps)}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor={ids.term} className="eyebrow">
            Term
          </label>
          <input
            id={ids.term}
            type="range"
            min={financeDefaults.minTermMonths}
            max={financeDefaults.maxTermMonths}
            step={6}
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            aria-valuetext={`${term} months`}
            className="voltaris-range mt-4 w-full"
          />
          <div className="mt-2 flex justify-between font-data text-sm tabular-nums">
            <span className="text-chrome">{term} months</span>
            <span className="text-steel">{(term / 12).toFixed(1).replace('.0', '')} years</span>
          </div>
        </div>

        <div>
          <label htmlFor={ids.rate} className="eyebrow">
            Annual interest rate
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {financePartners.map((partner) => (
              <button
                key={partner.id}
                type="button"
                aria-pressed={partnerId === partner.id && rateBps === partner.annualRateBps}
                onClick={() => choosePartner(partner)}
                className={cn(
                  'min-h-10 border px-3 font-data text-xs uppercase tracking-[0.08em]',
                  partnerId === partner.id && rateBps === partner.annualRateBps
                    ? 'border-chrome bg-chrome text-surface'
                    : 'border-hairline text-steel hover:border-chrome hover:text-chrome',
                )}
              >
                {partner.shortName} {fmtBps(partner.annualRateBps)}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-baseline gap-2 border-b border-hairline pb-2 focus-within:border-chrome">
            <input
              id={ids.rate}
              inputMode="decimal"
              value={(rateBps / 100).toString()}
              onChange={(e) => {
                const v = Math.round(parseFloat(e.target.value || '0') * 100);
                setRateBps(Number.isFinite(v) && v >= 0 ? Math.min(v, 6000) : 0);
              }}
              className="w-28 bg-transparent font-display text-xl tabular-nums text-chrome outline-none"
            />
            <span className="font-data text-sm text-steel-muted">% per year — edit to match your offer</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------ Output */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-hairline bg-abyss p-6 sm:p-8">
          <p className="eyebrow">Indicative monthly payment</p>
          <p
            aria-live="polite"
            className="mt-3 font-display text-[clamp(2.25rem,6vw,4rem)] leading-none tabular-nums tracking-tight text-chrome"
          >
            {formatPrice(loan.monthlyRwf)}
          </p>
          <p className="mt-2 font-data text-xs text-steel-muted">
            for {term} months at {fmtBps(rateBps)} p.a.
          </p>

          <div className="mt-8" aria-label="Share of total cost">
            <div className="flex h-2.5 w-full overflow-hidden bg-slab">
              <div className="bg-chrome" style={{ width: `${loan.shareBps.deposit / 100}%` }} title="Deposit" />
              <div className="bg-volt-deep" style={{ width: `${loan.shareBps.financed / 100}%` }} title="Financed" />
              <div className="bg-volt-bright" style={{ width: `${loan.shareBps.interest / 100}%` }} title="Interest" />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3 font-data text-xs">
              {[
                ['Deposit', loan.depositRwf, 'bg-chrome'],
                ['Financed', loan.financedRwf, 'bg-volt-deep'],
                ['Interest', loan.totalInterestRwf, 'bg-volt-bright'],
              ].map(([label, value, swatch]) => (
                <div key={label as string}>
                  <dt className="flex items-center gap-1.5 text-steel-muted">
                    <span className={cn('inline-block h-2 w-2', swatch as string)} aria-hidden="true" />
                    {label}
                  </dt>
                  <dd className="mt-1 tabular-nums text-chrome">{formatPrice(value as number)}</dd>
                </div>
              ))}
            </dl>
          </div>

          <dl className="mt-8 divide-y divide-hairline/60 border-y border-hairline/60">
            {[
              ['Total repayable', loan.totalRepayableRwf],
              ['Total cost of credit', loan.totalInterestRwf],
              ['Total you pay (deposit + repayments)', loan.totalCostRwf],
            ].map(([label, value]) => (
              <div key={label as string} className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-sm text-steel">{label}</dt>
                <dd className="font-data text-sm tabular-nums text-chrome">{formatPrice(value as number)}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 text-xs leading-relaxed text-steel-muted">
            Indicative only. The lender sets the final rate, fees and insurance at approval. No
            arrangement fee is charged by Voltaris.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------ Partners */}
      <section className="lg:col-span-2" aria-labelledby="partners-heading">
        <p className="eyebrow">Finance partners</p>
        <h2 id="partners-heading" className="mt-3 font-display text-display text-chrome">
          Same car, three ways to pay for it.
        </h2>
        <Reveal as="ul" stagger={120} className="mt-8 grid gap-px border border-hairline bg-hairline md:grid-cols-3">
          {perPartner.map(({ partner, loan: pl, term: pt }) => (
            <li key={partner.id} className="flex flex-col bg-surface p-6">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-xl text-chrome">{partner.name}</h3>
                <span className="font-data text-xs text-steel-muted">{fmtBps(partner.annualRateBps)} p.a.</span>
              </div>
              <p className="mt-5 font-display text-3xl tabular-nums tracking-tight text-chrome">
                {formatPrice(pl.monthlyRwf)}
                <span className="ml-1 font-data text-xs text-steel-muted">/ mo</span>
              </p>
              <p className="mt-1 font-data text-xs text-steel-muted">
                {pt} months · min. deposit {fmtBps(partner.minDepositBps)}
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-steel">{partner.note}</p>
              <button
                type="button"
                onClick={() => {
                  choosePartner(partner);
                  setApplyTo(partner);
                  requestAnimationFrame(() =>
                    document.getElementById('finance-apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
                  );
                }}
                className="mt-6 flex min-h-12 items-center justify-between bg-chrome px-5 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-deep"
              >
                Apply through Voltaris
                <span aria-hidden="true">→</span>
              </button>
            </li>
          ))}
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ Apply */}
      <Reveal as="section" id="finance-apply" className="scroll-mt-28 lg:col-span-2" aria-labelledby="apply-heading">
        <div className="grid gap-8 border-t border-hairline pt-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Apply</p>
            <h2 id="apply-heading" className="mt-3 font-display text-display text-chrome">
              {applyTo ? `Apply with ${applyTo.name}` : 'Send these numbers to an advisor'}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-steel">
              Your figures are attached below. An advisor confirms the vehicle, checks the deposit and
              term against the lender&rsquo;s rules, and walks the application in with you. One
              application, no repeated paperwork.
            </p>
            <ul className="mt-6 space-y-1 font-data text-xs text-steel-muted">
              {summaryLines.map((line) => (
                <li key={line as string}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <FinanceApplyForm
              key={`${applyTo?.id ?? 'none'}-${loan.monthlyRwf}`}
              source={`finance-${applyTo?.id ?? 'general'}`}
              summary={[applyTo ? `Lender: ${applyTo.name}` : null, ...summaryLines].filter(Boolean).join('\n')}
            />
          </div>
        </div>
      </Reveal>
    </div>
  );
}
