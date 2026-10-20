'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowRight,
  Compass,
  KeyRound,
  Map as MapIcon,
  Newspaper,
  Scale,
  Search,
  Star,
  Tag,
  User,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  minutes: number;
  image: { url: string; alt: string } | null;
}

const META: Record<string, { Icon: LucideIcon; color: string }> = {
  'buying-guides': { Icon: Tag, color: '#ffb15c' },
  reviews: { Icon: Star, color: '#ff9a5c' },
  comparisons: { Icon: Scale, color: '#a98bff' },
  charging: { Icon: Zap, color: '#5cc8ff' },
  ownership: { Icon: KeyRound, color: '#7be87f' },
  maintenance: { Icon: Wrench, color: '#ffd166' },
  market: { Icon: MapIcon, color: '#4ad0ff' },
  news: { Icon: Newspaper, color: '#5cc8ff' },
  'owner-stories': { Icon: User, color: '#ff8fb1' },
  insights: { Icon: Compass, color: '#12d6b0' },
};
const metaOf = (slug: string) => META[slug] ?? { Icon: Tag, color: '#5cc8ff' };
const tagOf = (slug: string) => {
  const s = slug.replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function mark(text: string, q: string): ReactNode {
  if (!q) return text;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  return text.split(re).map((part, i) => (i % 2 === 1 ? <mark key={i}>{part}</mark> : part));
}

function Dots({ minutes }: { minutes: number }) {
  return (
    <span className="gd-dots" aria-hidden="true">
      {Array.from({ length: 8 }, (_, k) => (
        <i key={k} className={k < Math.min(8, minutes) ? 'is-f' : undefined} />
      ))}
    </span>
  );
}

function Cover({ guide, sizes, priority = false }: { guide: Guide; sizes: string; priority?: boolean }) {
  return guide.image ? (
    <Image src={guide.image.url} alt={guide.image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
  ) : null;
}

export function GuidesExplorer({
  items,
  counts,
  categories,
  active,
  empty,
}: {
  items: Guide[];
  counts: Record<string, number> | null;
  categories: { slug: string; label: string }[];
  active: string | null;
  empty: ReactNode;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const qn = query.trim().toLowerCase();
  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : null;

  const filtered = items.filter((g) => !qn || `${g.title} ${g.excerpt} ${tagOf(g.category)}`.toLowerCase().includes(qn));
  const start = !active && !qn ? items[0] : undefined;
  const grid = start ? items.slice(1) : filtered;
  const shownCount = start ? items.length : filtered.length;

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

  const activeLabel = categories.find((c) => c.slug === active)?.label;

  return (
    <>
      <div className="gd-fb">
        <div className="gd-row">
          <div className={`gd-sb${query ? ' has' : ''}`} role="search">
            <Search size={20} aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the guides"
              autoComplete="off"
              aria-label="Search the guides"
            />
            <kbd>/</kbd>
          </div>
          <p className="gd-stat" aria-live="polite">
            <span>
              <b>{shownCount}</b> {shownCount === 1 ? 'guide' : 'guides'}
              {activeLabel ? ` in ${activeLabel}` : ''}
              {qn ? ` matching “${query.trim()}”` : ''}
            </span>
            {qn && (
              <button type="button" onClick={() => setQuery('')}>
                Clear search
              </button>
            )}
          </p>
        </div>

        <nav className="gd-chs" aria-label="Guide categories">
          <Link href="/guides" aria-current={!active ? 'page' : undefined} className={`gd-chip${!active ? ' is-on' : ''}`}>
            All {total !== null && <small>{total}</small>}
          </Link>
          {categories.map((c) => {
            const { Icon, color } = metaOf(c.slug);
            const n = counts?.[c.slug];
            return (
              <Link
                key={c.slug}
                href={`/guides?category=${c.slug}`}
                aria-current={active === c.slug ? 'page' : undefined}
                className={`gd-chip${active === c.slug ? ' is-on' : ''}${n === 0 ? ' is-zero' : ''}`}
                style={{ '--c': color } as CSSProperties}
              >
                <Icon size={18} aria-hidden="true" />
                {c.label}
                {n !== undefined && <small>{n}</small>}
              </Link>
            );
          })}
        </nav>
      </div>

      {items.length === 0 ? (
        <div className="gd-empty">{empty}</div>
      ) : (
        <>
          {start && (
            <Link href={`/guides/${start.slug}`} className="gd-st" style={{ '--c': metaOf(start.category).color } as CSSProperties}>
              <span className="gd-im">
                <Cover guide={start} sizes="(min-width: 980px) 55vw, 100vw" priority />
              </span>
              <span className="gd-bx">
                <span className="gd-tags">
                  <span className="gd-pill gd-new">Start here</span>
                  <span className="gd-pill">
                    {(() => {
                      const { Icon } = metaOf(start.category);
                      return <Icon size={14} aria-hidden="true" />;
                    })()}
                    {tagOf(start.category)}
                  </span>
                  <span className="gd-pill">{start.minutes} min read</span>
                </span>
                <span className="gd-h2">{start.title}</span>
                <span className="gd-p">{start.excerpt}</span>
                <span className="gd-go">
                  Read the guide
                  <span>
                    <ArrowRight size={20} strokeWidth={2.4} />
                  </span>
                </span>
              </span>
            </Link>
          )}

          <div className="gd-gr">
            {grid.map((g, i) => {
              const { Icon, color } = metaOf(g.category);
              return (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="gd-pc" style={{ '--c': color, '--d': i % 3 } as CSSProperties}>
                  <span className="gd-im gd-card">
                    <Cover guide={g} sizes="(min-width: 1024px) 30vw, (min-width: 700px) 50vw, 100vw" />
                    <span className="gd-pill">
                      <Icon size={14} aria-hidden="true" />
                      {tagOf(g.category)}
                    </span>
                  </span>
                  <span className="gd-bd">
                    <span className="gd-mt">
                      <Dots minutes={g.minutes} /> {g.minutes} min read
                    </span>
                    <span className="gd-h3">{mark(g.title, qn)}</span>
                    <span className="gd-ex">{mark(g.excerpt, qn)}</span>
                    <span className="gd-rd">
                      Read the guide <ArrowRight size={18} aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="gd-none">
              <h3>No guide matches that</h3>
              <p>Try another word, or clear the search.</p>
              <button type="button" className="gd-btn" onClick={() => setQuery('')}>
                Clear search
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
