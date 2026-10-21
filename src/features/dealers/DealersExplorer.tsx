'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, MapPin, MessageCircle, Search, ShieldCheck } from 'lucide-react';

export interface DealerCardData {
  id: string;
  slug: string;
  name: string;
  city: string;
  verified: boolean;
  vehicleCount: number;
  logo: string | null;
  whatsapp: string | null;
}

const HUES = ['#2b6fe0', '#12d6b0', '#a98bff', '#ffb15c', '#5cc8ff', '#ff8fb1'];
const initialOf = (name: string) => (name.trim().charAt(0) || '·').toUpperCase();

/** One dealer's profile card: logo first, then who and where, then the verification. */
function Profile({ d, i, maxV, clone }: { d: DealerCardData; i: number; maxV: number; clone: boolean }) {
  const href = `/dealers/${d.slug}`;
  const n = d.vehicleCount;
  const tab = clone ? -1 : undefined;
  return (
    <article
      className="dl-pc"
      aria-hidden={clone ? true : undefined}
      data-clone={clone ? '' : undefined}
      style={{ '--c1': HUES[i % HUES.length] } as CSSProperties}
    >
      <Link href={href} className="dl-cover" aria-label={`View ${d.name}`} tabIndex={tab} />
      <div className="dl-top">
        <span className="dl-lg" aria-hidden="true">
          {d.logo ? <Image src={d.logo} alt="" width={96} height={96} unoptimized /> : <b>{initialOf(d.name)}</b>}
        </span>
        {d.city && (
          <span className="dl-pill">
            <MapPin size={14} aria-hidden="true" />
            {d.city}
          </span>
        )}
      </div>
      <h2 className="dl-name">{d.name}</h2>
      <p className="dl-meta">
        {d.city ? `${d.city} · ` : ''}
        {n} {n === 1 ? 'vehicle' : 'vehicles'} listed
      </p>
      <div className="dl-vb">
        <span>
          Vehicles <b>{n}</b>
        </span>
        <i style={{ '--w': `${Math.round((n / maxV) * 100)}%` } as CSSProperties} />
      </div>
      {d.verified ? (
        <span className="dl-bdg dl-ok">
          <ShieldCheck size={14} aria-hidden="true" />
          Documents verified
        </span>
      ) : (
        <span className="dl-bdg dl-no">Not yet verified</span>
      )}
      <div className="dl-acts">
        <Link href={href} className="dl-view" tabIndex={tab}>
          View dealer
          <span>
            <ArrowRight size={20} strokeWidth={2.4} />
          </span>
        </Link>
        {d.whatsapp && (
          <a href={d.whatsapp} target="_blank" rel="noopener noreferrer" className="dl-wa" aria-label={`WhatsApp ${d.name}`} tabIndex={tab}>
            <MessageCircle size={22} />
          </a>
        )}
      </div>
    </article>
  );
}

export function DealersExplorer({
  dealers,
  showStats,
  empty,
}: {
  dealers: DealerCardData[];
  showStats: boolean;
  empty: ReactNode;
}) {
  const [place, setPlace] = useState('all');
  const [query, setQuery] = useState('');
  const [onlyOk, setOnlyOk] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const places = Array.from(new Set(dealers.map((d) => d.city).filter(Boolean)));
  const qn = query.trim().toLowerCase();
  const filtering = place !== 'all' || qn !== '' || onlyOk;
  const list = dealers.filter(
    (d) =>
      (place === 'all' || d.city === place) &&
      (!onlyOk || d.verified) &&
      (!qn || d.name.toLowerCase().includes(qn)),
  );
  const maxV = Math.max(1, ...dealers.map((d) => d.vehicleCount));

  // Sliding needs a few cards to be worth it; one or two just sit still, centred.
  const slides = list.length >= 3;
  // Enough copies that the track is always wider than the screen plus one full set, so the loop has no gap.
  const copies = Math.max(2, Math.ceil(8 / Math.max(list.length, 1)) + 1);
  const seconds = Math.max(28, list.length * 6);

  function reset() {
    setPlace('all');
    setQuery('');
    setOnlyOk(false);
  }

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

  if (dealers.length === 0) return <div className="dl-empty">{empty}</div>;

  return (
    <>
      <div className="dl-tb">
        <div className="dl-row">
          <div className={`dl-sb${query ? ' has' : ''}`} role="search">
            <Search size={20} aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dealers"
              autoComplete="off"
              aria-label="Search dealers"
            />
            <kbd>/</kbd>
          </div>
          {showStats && (
            <div className="dl-stats">
              <span className="dl-sp">
                <b>{dealers.length}</b> dealers
              </span>
              <span className="dl-sp">
                <b>{dealers.reduce((a, d) => a + d.vehicleCount, 0)}</b> vehicles
              </span>
              <span className="dl-sp">
                <b>{dealers.filter((d) => d.verified).length}</b> verified
              </span>
            </div>
          )}
        </div>

        <div className="dl-chs" role="group" aria-label="Filter by place">
          <button type="button" className={`dl-chip${place === 'all' ? ' is-on' : ''}`} aria-pressed={place === 'all'} onClick={() => setPlace('all')}>
            All <small>{dealers.length}</small>
          </button>
          {places.map((p) => (
            <button key={p} type="button" className={`dl-chip${place === p ? ' is-on' : ''}`} aria-pressed={place === p} onClick={() => setPlace(p)}>
              <MapPin size={14} aria-hidden="true" />
              {p} <small>{dealers.filter((d) => d.city === p).length}</small>
            </button>
          ))}
          <button type="button" role="switch" aria-checked={onlyOk} className="dl-sw" onClick={() => setOnlyOk((v) => !v)}>
            <i />
            Documents verified only
          </button>
        </div>
      </div>

      <p className="dl-cnt" aria-live="polite">
        <span>
          <b>{list.length}</b> {list.length === 1 ? 'dealer' : 'dealers'}
          {place !== 'all' ? ` in ${place}` : ''}
          {onlyOk ? ' · documents verified' : ''}
          {qn ? ` matching “${query.trim()}”` : ''}
        </span>
        {filtering && (
          <button type="button" onClick={reset}>
            Clear filters
          </button>
        )}
      </p>

      {list.length === 0 ? (
        <div className="dl-none">
          <h3>No dealer matches that</h3>
          <p>Try another place or word, or clear the filters.</p>
          <button type="button" className="dl-btn" onClick={reset}>
            Clear filters
          </button>
        </div>
      ) : slides ? (
        <div className="dl-viewport" role="region" aria-label="Dealers">
          <div className="dl-track" style={{ '--copies': copies, '--dur': `${seconds}s` } as CSSProperties}>
            {Array.from({ length: copies }, (_, c) =>
              list.map((d, i) => <Profile key={`${c}-${d.id}`} d={d} i={i} maxV={maxV} clone={c > 0} />),
            )}
          </div>
        </div>
      ) : (
        <div className="dl-still">
          {list.map((d, i) => (
            <Profile key={d.id} d={d} i={i} maxV={maxV} clone={false} />
          ))}
        </div>
      )}
    </>
  );
}
