import { Inter } from 'next/font/google';
import Link from 'next/link';
import s from './market.module.css';

// Display weights for the car names and prices (the site's own Inter stays 400–600).
const heavy = Inter({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-inter-heavy',
  display: 'swap',
});

/** Every Explore destination, in the order people browse them. */
export const EXPLORE = [
  { href: '/cars', label: 'Cars', color: '#35a2ff' },
  { href: '/electric-cars-kigali', label: 'Electric cars in Kigali', color: '#5cc8ff' },
  { href: '/electric-cars-rwanda', label: 'Electric cars in Rwanda', color: '#1c3fb8' },
  { href: '/electric-suvs-rwanda', label: 'Electric SUVs', color: '#2b86f0' },
  { href: '/electric-sedans-rwanda', label: 'Electric sedans', color: '#7fd4ff' },
  { href: '/used-electric-cars-rwanda', label: 'Used electric cars', color: '#0d1a55' },
] as const;

/**
 * The frame every marketplace page shares: Buy / Rent switch, Explore chips,
 * then the feed. The page title is kept for search engines and screen readers
 * only — the switch and the chips already say where you are.
 */
export function MarketShell({
  title,
  mode,
  current,
  total,
  children,
}: {
  title: string;
  mode: 'sale' | 'rental';
  /** The path of this page, to light up its switch side or chip. */
  current: string;
  total?: number;
  children: React.ReactNode;
}) {
  return (
    <div className={`${s.market} ${heavy.variable}`} data-market="">
      <div className={s.wrap}>
        <h1 className={s.srOnly}>{title}</h1>
        <div className={s.bar}>
          <nav className={s.gate} data-m={mode} aria-label="Buy or rent">
            <i aria-hidden="true" />
            <Link href="/buy" aria-current={mode === 'sale' ? 'page' : undefined}>
              Buy
            </Link>
            <Link href="/rent" aria-current={mode === 'rental' ? 'page' : undefined}>
              Rent
            </Link>
          </nav>
          <nav className={s.explore} aria-label="Explore">
            <span className={s.exploreLabel}>Explore</span>
            <div className={s.pills}>
              {EXPLORE.map((e) => {
                const on = e.href === current;
                return (
                  <Link
                    key={e.href}
                    href={e.href}
                    className={s.pill}
                    style={{ '--k': e.color } as React.CSSProperties}
                    aria-current={on ? 'page' : undefined}
                  >
                    <b aria-hidden="true" />
                    {e.label}
                    {on && typeof total === 'number' && total > 0 && <em>{total}</em>}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}
