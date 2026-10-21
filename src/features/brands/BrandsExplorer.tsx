'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, Search } from 'lucide-react';

export interface BrandCardData {
  value: string;
  label: string;
  count: number;
  logo: string | null;
}

const HUES = ['#2b6fe0', '#12d6b0', '#a98bff', '#ffb15c', '#5cc8ff', '#ff8fb1'];
const initialOf = (name: string) => (name.trim().charAt(0) || '·').toUpperCase();

/** One brand's profile card: logo first, then the name and how many cars are listed. */
function Profile({ b, i, maxV, clone }: { b: BrandCardData; i: number; maxV: number; clone: boolean }) {
  const href = `/brands/${b.value}`;
  const tab = clone ? -1 : undefined;
  return (
    <article
      className="br-pc"
      aria-hidden={clone ? true : undefined}
      data-clone={clone ? '' : undefined}
      style={{ '--c1': HUES[i % HUES.length] } as CSSProperties}
    >
      <Link href={href} className="br-cover" aria-label={`View ${b.label}`} tabIndex={tab} />
      <div className="br-top">
        <span className="br-lg" aria-hidden="true">
          {b.logo ? <Image src={b.logo} alt="" width={96} height={96} unoptimized /> : <b>{initialOf(b.label)}</b>}
        </span>
      </div>
      <h2 className="br-name">{b.label}</h2>
      <p className="br-meta">
        {b.count} {b.count === 1 ? 'car' : 'cars'} listed
      </p>
      <div className="br-vb">
        <span>
          Cars <b>{b.count}</b>
        </span>
        <i style={{ '--w': `${Math.round((b.count / maxV) * 100)}%` } as CSSProperties} />
      </div>
      <div className="br-acts">
        <Link href={href} className="br-view" tabIndex={tab}>
          View {b.label}
          <span>
            <ArrowRight size={20} strokeWidth={2.4} />
          </span>
        </Link>
      </div>
    </article>
  );
}

export function BrandsExplorer({ brands, empty }: { brands: BrandCardData[]; empty: ReactNode }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'cars' | 'az'>('cars');
  const inputRef = useRef<HTMLInputElement>(null);

  const qn = query.trim().toLowerCase();
  const list = brands
    .filter((b) => !qn || b.label.toLowerCase().includes(qn))
    .sort((a, b) => (sort === 'cars' ? b.count - a.count || a.label.localeCompare(b.label) : a.label.localeCompare(b.label)));
  const maxV = Math.max(1, ...brands.map((b) => b.count));

  // Sliding needs a few cards to be worth it; one or two just sit still, centred.
  const slides = list.length >= 3;
  // Enough copies that the track is always wider than the screen plus one full set, so the loop has no gap.
  const copies = Math.max(2, Math.ceil(8 / Math.max(list.length, 1)) + 1);
  const seconds = Math.max(28, list.length * 6);

  // "/" jumps to the search box, Escape clears it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && el === inputRef.current) {
        setQuery('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (brands.length === 0) return <div className="br-empty">{empty}</div>;

  return (
    <>
      <div className="br-tb">
        <div className="br-row">
          <div className={`br-sb${query ? ' has' : ''}`} role="search">
            <Search size={20} aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brands"
              autoComplete="off"
              aria-label="Search brands"
            />
            <kbd>/</kbd>
          </div>
          <div className="br-stats">
            <span className="br-sp">
              <b>{brands.length}</b> brands
            </span>
            <span className="br-sp">
              <b>{brands.reduce((a, b) => a + b.count, 0)}</b> cars
            </span>
          </div>
        </div>
        <div className="br-chs" role="group" aria-label="Sort brands">
          <button type="button" className={`br-chip${sort === 'cars' ? ' is-on' : ''}`} aria-pressed={sort === 'cars'} onClick={() => setSort('cars')}>
            Most cars
          </button>
          <button type="button" className={`br-chip${sort === 'az' ? ' is-on' : ''}`} aria-pressed={sort === 'az'} onClick={() => setSort('az')}>
            A–Z
          </button>
        </div>
      </div>

      <p className="br-cnt" aria-live="polite">
        <span>
          <b>{list.length}</b> {list.length === 1 ? 'brand' : 'brands'}
          {qn ? ` matching “${query.trim()}”` : ''}
        </span>
        {qn && (
          <button type="button" onClick={() => setQuery('')}>
            Clear search
          </button>
        )}
      </p>

      {list.length === 0 ? (
        <div className="br-none">
          <h3>No brand matches that</h3>
          <p>Try another word, or clear the search.</p>
          <button type="button" className="br-btn" onClick={() => setQuery('')}>
            Clear search
          </button>
        </div>
      ) : slides ? (
        <div className="br-viewport" role="region" aria-label="Brands">
          <div className="br-track" style={{ '--copies': copies, '--dur': `${seconds}s` } as CSSProperties}>
            {Array.from({ length: copies }, (_, c) =>
              list.map((b, i) => <Profile key={`${c}-${b.value}`} b={b} i={i} maxV={maxV} clone={c > 0} />),
            )}
          </div>
        </div>
      ) : (
        <div className="br-still">
          {list.map((b, i) => (
            <Profile key={b.value} b={b} i={i} maxV={maxV} clone={false} />
          ))}
        </div>
      )}
    </>
  );
}
