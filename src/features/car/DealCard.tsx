'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CreditCard,
  Headset,
  MessageCircle,
  CarFront,
  ShieldCheck,
} from 'lucide-react';
import { CompareToggleButton } from '@/components/CompareToggleButton';
import { financeDefaults, financePartners } from '@/config/finance';
import { RentalCheckoutPanel } from '@/features/vehicles/RentalCheckoutPanel';
import { computeLoan, depositFromBps } from '@/lib/finance/amortisation';
import { formatPrice } from '@/lib/format';
import { initials, type CarMode } from './model';
import c from './car.module.css';

export interface DealProps {
  id: string;
  slug: string;
  mode: CarMode;
  canBuy: boolean;
  canRent: boolean;
  price: number | null;
  perDay: number | null;
  currency: string;
  status: 'available' | 'reserved' | 'sold' | 'unavailable';
  financing: boolean;
  testDriveHref: string | null;
  reserveHref: string | null;
  whatsappHref: string | null;
  rentalCheckout: boolean;
  seller: { name: string; slug?: string; type: 'dealer' | 'private'; verified: boolean };
}

/** The cheapest indicative partner rate — the calculator's starting point, never an offer. */
const BEST = financePartners.reduce((a, b) => (b.annualRateBps < a.annualRateBps ? b : a));

/**
 * Price and every action, in one card that stays beside the car on wide
 * screens. Buy and Rent look the same; only what is inside changes.
 */
export function DealCard(p: DealProps) {
  const gone = p.status === 'sold' || p.status === 'unavailable';
  const sale = p.mode === 'sale';
  const enquireHref = `/cars/${p.slug}/enquire${sale ? '' : '?mode=rental'}`;

  return (
    <div className={c.deal} id="deal">
      {p.canBuy && p.canRent && (
        <nav className={c.gate} data-m={p.mode} aria-label="Buy or rent this car">
          <i aria-hidden="true" />
          <Link
            href={`/cars/${p.slug}?mode=sale`}
            scroll={false}
            replace
            aria-current={sale ? 'page' : undefined}
          >
            Buy
          </Link>
          <Link
            href={`/cars/${p.slug}?mode=rental`}
            scroll={false}
            replace
            aria-current={!sale ? 'page' : undefined}
          >
            Rent
          </Link>
        </nav>
      )}

      <div className={c.priceBlock}>
        <span className={c.status} data-s={p.status}>
          <i aria-hidden="true" />
          {p.status === 'available'
            ? sale
              ? 'For sale'
              : 'For rent'
            : p.status === 'reserved'
              ? 'Reserved'
              : p.status === 'sold'
                ? 'Sold'
                : 'Unavailable'}
        </span>
        <p className={c.price}>
          {sale
            ? formatPrice(p.price, p.currency)
            : p.perDay
              ? formatPrice(p.perDay, p.currency)
              : 'On request'}
          {!sale && p.perDay ? <small> / day</small> : null}
        </p>
        {sale && p.canRent && p.perDay ? (
          <p className={c.priceAlt}>or {formatPrice(p.perDay, p.currency)} a day to rent</p>
        ) : !sale && p.canBuy && p.price ? (
          <p className={c.priceAlt}>or {formatPrice(p.price, p.currency)} to buy</p>
        ) : null}
      </div>

      {gone ? (
        <div className={c.goneNote}>
          <p>
            {p.status === 'sold'
              ? 'This car has found its owner.'
              : 'This car is not available right now.'}
          </p>
          <a href="#more" className={c.btnGhost}>
            See similar cars <ArrowRight aria-hidden="true" />
          </a>
        </div>
      ) : sale ? (
        <>
          {p.financing && p.price ? (
            <Estimator price={p.price} currency={p.currency} slug={p.slug} />
          ) : null}
          <div className={c.actions}>
            {p.reserveHref ? (
              <Link href={p.reserveHref} className={c.btnPrimary}>
                Reserve this car <ArrowRight aria-hidden="true" />
              </Link>
            ) : null}
            {p.testDriveHref ? (
              <Link href={p.testDriveHref} className={p.reserveHref ? c.btnSoft : c.btnPrimary}>
                <CarFront aria-hidden="true" /> Book a free test drive
              </Link>
            ) : null}
            {!p.reserveHref && !p.testDriveHref ? (
              <Link href={enquireHref} className={c.btnPrimary}>
                Ask about this car <ArrowRight aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </>
      ) : p.rentalCheckout && p.perDay ? (
        <div className={c.rent} id="rental-details">
          <RentalCheckoutPanel vehicleId={p.id} dailyRate={p.perDay} currency={p.currency} />
        </div>
      ) : (
        <div className={c.actions}>
          <Link href={enquireHref} className={c.btnPrimary}>
            <CalendarCheck aria-hidden="true" /> Ask to rent this car
          </Link>
        </div>
      )}

      <div className={c.minor}>
        {p.whatsappHref && !gone && (
          <a href={p.whatsappHref} target="_blank" rel="noopener noreferrer" className={c.btnGhost}>
            <MessageCircle aria-hidden="true" /> WhatsApp
          </a>
        )}
        {!gone && (
          <Link href={enquireHref} className={c.btnGhost}>
            <Headset aria-hidden="true" /> Ask a question
          </Link>
        )}
        <div className={c.compare}>
          <CompareToggleButton vehicleId={p.id} mode={p.mode} variant="button" />
        </div>
      </div>

      <div className={c.seller}>
        <span className={c.mono} aria-hidden="true">
          {initials(p.seller.name)}
        </span>
        <div>
          {p.seller.slug ? (
            <Link href={`/dealers/${p.seller.slug}`}>{p.seller.name}</Link>
          ) : (
            <b>{p.seller.name}</b>
          )}
          <span>
            {p.seller.type === 'dealer' ? 'Registered dealer' : 'Private owner'}
            {p.seller.verified && (
              <>
                {' '}
                · <BadgeCheck aria-hidden="true" /> Verified
              </>
            )}
          </span>
        </div>
      </div>

      <ul className={c.trust}>
        <li>
          <ShieldCheck aria-hidden="true" /> Secure
        </li>
        <li>
          <CreditCard aria-hidden="true" /> MoMo or card
        </li>
        <li>
          <Headset aria-hidden="true" /> Real people
        </li>
      </ul>
    </div>
  );
}

function Estimator({ price, currency, slug }: { price: number; currency: string; slug: string }) {
  const [dep, setDep] = useState(financeDefaults.depositBps / 100);
  const [term, setTerm] = useState<number>(financeDefaults.termMonths);
  const monthly = useMemo(() => {
    try {
      return computeLoan({
        priceRwf: Math.round(price),
        depositRwf: depositFromBps(Math.round(price), dep * 100),
        annualRateBps: BEST.annualRateBps,
        termMonths: term,
      }).monthlyRwf;
    } catch {
      return null;
    }
  }, [price, dep, term]);
  const rate = (BEST.annualRateBps / 100).toLocaleString('en-US', { maximumFractionDigits: 2 });

  return (
    <div className={c.est}>
      <div className={c.estHead}>
        <span>Pay monthly</span>
        <b>
          {monthly === null ? '—' : formatPrice(monthly, currency)}
          <small> / month</small>
        </b>
      </div>
      <label className={c.sliderLabel}>
        <span>Deposit</span>
        <b>
          {dep}% · {formatPrice(depositFromBps(Math.round(price), dep * 100), currency)}
        </b>
      </label>
      <input
        type="range"
        min={10}
        max={60}
        step={5}
        value={dep}
        aria-label="Deposit"
        onChange={(e) => setDep(Number(e.target.value))}
        className={c.slider}
        style={{ '--fill': `${((dep - 10) / 50) * 100}%` } as React.CSSProperties}
      />
      <label className={c.sliderLabel}>
        <span>Term</span>
        <b>{term} months</b>
      </label>
      <input
        type="range"
        min={financeDefaults.minTermMonths}
        max={financeDefaults.maxTermMonths}
        step={12}
        value={term}
        aria-label="Term in months"
        onChange={(e) => setTerm(Number(e.target.value))}
        className={c.slider}
        style={
          {
            '--fill': `${((term - financeDefaults.minTermMonths) / (financeDefaults.maxTermMonths - financeDefaults.minTermMonths)) * 100}%`,
          } as React.CSSProperties
        }
      />
      <p className={c.fine}>
        Indicative at {rate}% a year with {BEST.shortName}. Your bank sets the final rate.{' '}
        <Link href={`/finance?vehicle=${encodeURIComponent(slug)}`}>Compare lenders</Link>
      </p>
    </div>
  );
}
