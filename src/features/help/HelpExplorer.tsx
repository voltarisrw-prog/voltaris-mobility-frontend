'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Link2, Search, X } from 'lucide-react';

interface Faq {
  q: string;
  a: string;
}
interface Section {
  heading: string;
  faqs: Faq[];
}

// Photos for the category tiles, used in order. Add or swap files in /public as you like.
const TILE_IMAGES = [
  '/hero/gallery/hero-01.png',
  '/hero/gallery/hero-02.png',
  '/hero/gallery/hero-03.png',
  '/hero/gallery/hero-04.png',
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const pad = (n: number) => String(n + 1).padStart(2, '0');

function mark(text: string, q: string): ReactNode {
  if (!q) return text;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  return text.split(re).map((part, i) => (i % 2 === 1 ? <mark key={i}>{part}</mark> : part));
}

export function HelpExplorer({ sections, contactHref }: { sections: Section[]; contactHref: string }) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<string>('all');
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groups = useMemo(
    () =>
      sections.map((s, gi) => {
        const key = slug(s.heading) || `group-${gi}`;
        return {
          key,
          heading: s.heading,
          img: TILE_IMAGES[gi % TILE_IMAGES.length]!,
          items: s.faqs.map((f, i) => ({ ...f, id: `${key}-${i + 1}`, n: i })),
        };
      }),
    [sections],
  );

  const qn = query.trim().toLowerCase();
  const matches = (it: { q: string; a: string }) => !qn || `${it.q} ${it.a}`.toLowerCase().includes(qn);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const visibleGroups = groups
    .filter((g) => cat === 'all' || g.key === cat)
    .map((g) => ({ ...g, items: g.items.filter(matches) }))
    .filter((g) => g.items.length > 0);
  const visibleIds = visibleGroups.flatMap((g) => g.items.map((i) => i.id));
  const count = visibleIds.length;
  const allOpen = count > 0 && visibleIds.every((id) => open.has(id));

  function onQuery(value: string) {
    setQuery(value);
    const v = value.trim().toLowerCase();
    // While searching, every match opens so the answer is already on screen.
    if (!v) {
      setOpen(new Set());
      return;
    }
    const next = new Set<string>();
    groups.forEach((g) =>
      g.items.forEach((it) => {
        if (`${it.q} ${it.a}`.toLowerCase().includes(v)) next.add(it.id);
      }),
    );
    setOpen(next);
  }

  function toggle(id: string) {
    setOpen((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function say(message: string) {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 1800);
  }

  async function copyLink(id: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${id}`);
    } catch {
      /* the confirmation still shows when the clipboard is blocked */
    }
    say('Link copied');
  }

  // A link such as /help#selling-1 opens that question.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id || !groups.some((g) => g.items.some((i) => i.id === id))) return;
    setOpen(new Set([id]));
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
    return () => clearTimeout(t);
  }, [groups]);

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
        onQuery('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  return (
    <>
      <div className={`hp-sb${query ? ' has' : ''}`} role="search">
        <Search size={24} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search the questions"
          autoComplete="off"
          aria-label="Search the questions"
        />
        <kbd>/</kbd>
        <button type="button" className="hp-clr" aria-label="Clear search" onClick={() => { onQuery(''); inputRef.current?.focus(); }}>
          <X size={16} />
        </button>
      </div>
      <p className="hp-rc" aria-live="polite">
        {qn ? `${count} ${count === 1 ? 'question matches' : 'questions match'} “${query.trim()}”` : ''}
      </p>

      <div className="hp-tiles">
        {groups.map((g) => (
          <button
            key={g.key}
            type="button"
            className={`hp-tl${cat === g.key ? ' is-on' : ''}`}
            aria-pressed={cat === g.key}
            onClick={() => {
              const next = cat === g.key ? 'all' : g.key;
              setCat(next);
              if (next !== 'all') requestAnimationFrame(() => document.getElementById(`hp-g-${g.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
            }}
          >
            <span className="hp-im">
              <Image src={g.img} alt="" fill sizes="(min-width: 980px) 22vw, 50vw" />
            </span>
            <span className="hp-ar" aria-hidden="true">
              <ArrowRight size={20} strokeWidth={2.2} />
            </span>
            <b>{g.heading}</b>
            <small>{g.items.length} questions</small>
          </button>
        ))}
      </div>

      <div className="hp-bar">
        <span className="hp-stat">
          <b>{count}</b> of {total} questions{cat !== 'all' ? ` · ${groups.find((g) => g.key === cat)?.heading ?? ''}` : ''}
        </span>
        <button
          type="button"
          className="hp-act"
          onClick={() => setOpen(allOpen ? new Set() : new Set(visibleIds))}
        >
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      {visibleGroups.map((g) => (
        <section key={g.key} className="hp-grp" id={`hp-g-${g.key}`} aria-labelledby={`hp-h-${g.key}`}>
          <div className="hp-gh">
            <h2 id={`hp-h-${g.key}`}>{g.heading}</h2>
            <i />
            <small>{g.items.length}</small>
          </div>
          <div className="hp-qs">
            {g.items.map((it) => {
              const isOpen = open.has(it.id);
              return (
                <div key={it.id} id={it.id} className={`hp-qi${isOpen ? ' is-open' : ''}`}>
                  <h3>
                    <button type="button" className="hp-qb" aria-expanded={isOpen} aria-controls={`p-${it.id}`} onClick={() => toggle(it.id)}>
                      <span className="hp-qn">{pad(it.n)}</span>
                      <span className="hp-qt">{mark(it.q, qn)}</span>
                      <span className="hp-qx" aria-hidden="true">
                        <i />
                        <i />
                      </span>
                    </button>
                  </h3>
                  <div className="hp-qp" id={`p-${it.id}`} role="region" aria-label={it.q} aria-hidden={!isOpen}>
                    <div className="hp-qa">
                      <div className="hp-qai">
                        <p>{mark(it.a, qn)}</p>
                        <div className="hp-qr">
                          <button type="button" className="hp-cl" tabIndex={isOpen ? 0 : -1} onClick={() => void copyLink(it.id)}>
                            <Link2 size={16} /> Copy link
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {count === 0 && (
        <div className="hp-none">
          <h3>No question matches that</h3>
          <p>A person reads every message and replies within a working day.</p>
          <Link href={contactHref} className="hp-big">
            Contact us
            <span>
              <ArrowRight size={24} strokeWidth={2.4} />
            </span>
          </Link>
        </div>
      )}

      <div className={`hp-toast${toast ? ' is-on' : ''}`} role="status">
        {toast}
      </div>
    </>
  );
}
