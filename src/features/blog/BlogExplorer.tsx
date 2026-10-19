'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, Clock, Search } from 'lucide-react';

export interface BlogCard {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  minutes: number;
  date: string;
  dateLong: string;
  author?: string | undefined;
  image: { url: string; alt: string } | null;
}

const COLORS: Record<string, string> = {
  news: '#5cc8ff',
  insights: '#12d6b0',
  'buying-guides': '#ffb15c',
  comparisons: '#a98bff',
  ownership: '#7be87f',
  'owner-stories': '#ff8fb1',
  market: '#4ad0ff',
  reviews: '#ff9a5c',
};
const colorOf = (c: string) => COLORS[c] ?? '#5cc8ff';
const label = (c: string) => {
  const s = c.replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
};
const PAGE = 9;

function mark(text: string, q: string): ReactNode {
  if (!q) return text;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  return text.split(re).map((part, i) => (i % 2 === 1 ? <mark key={i}>{part}</mark> : part));
}

function Cover({ card, sizes, priority = false }: { card: BlogCard; sizes: string; priority?: boolean }) {
  return card.image ? (
    <Image src={card.image.url} alt={card.image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
  ) : null;
}

export function BlogExplorer({ posts }: { posts: BlogCard[] }) {
  const [cat, setCat] = useState('all');
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(PAGE);
  const inputRef = useRef<HTMLInputElement>(null);

  const cats = useMemo(() => Array.from(new Set(posts.map((p) => p.category))), [posts]);
  const lead = posts[0];
  const qn = query.trim().toLowerCase();
  const filtering = cat !== 'all' || qn !== '';

  const pool = filtering ? posts : posts.slice(1);
  const list = pool.filter(
    (p) =>
      (cat === 'all' || p.category === cat) &&
      (!qn || `${p.title} ${p.excerpt} ${label(p.category)}`.toLowerCase().includes(qn)),
  );
  const total = filtering ? list.length : posts.length;
  const visible = list.slice(0, shown);

  function reset() {
    setCat('all');
    setQuery('');
    setShown(PAGE);
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
        setShown(PAGE);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {!filtering && lead && (
        <Link href={`/blog/${lead.slug}`} className="bl-ft" style={{ '--c': colorOf(lead.category) } as CSSProperties}>
          <span className="bl-fim">
            <Cover card={lead} sizes="(min-width: 1240px) 1200px, 100vw" priority />
          </span>
          <span className="bl-fbx">
            <span className="bl-tags">
              <span className="bl-pill bl-new">Latest</span>
              <span className="bl-pill">
                <i />
                {label(lead.category)}
              </span>
              <span className="bl-pill">
                <Clock size={13} aria-hidden="true" /> {lead.minutes} min
              </span>
            </span>
            <span className="bl-fh">{lead.title}</span>
            <span className="bl-fp">{lead.excerpt}</span>
            <span className="bl-by">
              {lead.author ? `${lead.author} · ` : ''}
              {lead.dateLong}
            </span>
            <span className="bl-go">
              Read the story
              <span>
                <ArrowRight size={20} strokeWidth={2.4} />
              </span>
            </span>
          </span>
        </Link>
      )}

      <div className="bl-fb">
        <div className="bl-chs" role="group" aria-label="Filter by topic">
          <button
            type="button"
            className={`bl-chip${cat === 'all' ? ' is-on' : ''}`}
            aria-pressed={cat === 'all'}
            onClick={() => {
              setCat('all');
              setShown(PAGE);
            }}
          >
            All <small>{posts.length}</small>
          </button>
          {cats.map((c) => (
            <button
              key={c}
              type="button"
              className={`bl-chip${cat === c ? ' is-on' : ''}`}
              aria-pressed={cat === c}
              style={{ '--c': colorOf(c) } as CSSProperties}
              onClick={() => {
                setCat(c);
                setShown(PAGE);
              }}
            >
              <i />
              {label(c)} <small>{posts.filter((p) => p.category === c).length}</small>
            </button>
          ))}
        </div>
        <div className={`bl-sb${query ? ' has' : ''}`} role="search">
          <Search size={20} aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShown(PAGE);
            }}
            placeholder="Search stories"
            autoComplete="off"
            aria-label="Search stories"
          />
          <kbd>/</kbd>
        </div>
      </div>

      <p className="bl-stat" aria-live="polite">
        <span>
          <b>{total}</b> {total === 1 ? 'story' : 'stories'}
          {cat !== 'all' ? ` in ${label(cat)}` : ''}
          {qn ? ` matching “${query.trim()}”` : ''}
        </span>
        {filtering && (
          <button type="button" onClick={reset}>
            Clear filters
          </button>
        )}
      </p>

      <div className="bl-gr">
        {visible.map((p, i) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="bl-pc"
            style={{ '--c': colorOf(p.category), '--d': i % 3 } as CSSProperties}
          >
            <span className="bl-im">
              <Cover card={p} sizes="(min-width: 1024px) 30vw, (min-width: 700px) 50vw, 100vw" />
              <span className="bl-pill">
                <i />
                {label(p.category)}
              </span>
            </span>
            <span className="bl-bd">
              <span className="bl-mt">
                <Clock size={14} aria-hidden="true" /> {p.minutes} min · {p.date}
                {p.author ? ` · ${p.author}` : ''}
              </span>
              <span className="bl-h3">{mark(p.title, qn)}</span>
              <span className="bl-ex">{mark(p.excerpt, qn)}</span>
              <span className="bl-rd">
                Read <ArrowRight size={18} aria-hidden="true" />
              </span>
            </span>
          </Link>
        ))}
      </div>

      {total === 0 && (
        <div className="bl-none">
          <h3>No story matches that</h3>
          <p>Try another word, or clear the filters.</p>
          <button type="button" className="bl-btn" onClick={reset}>
            Clear filters
          </button>
        </div>
      )}

      {visible.length < list.length && (
        <div className="bl-more">
          <button type="button" className="bl-btn bl-gh" onClick={() => setShown((n) => n + 6)}>
            Show more stories
          </button>
        </div>
      )}
    </>
  );
}
