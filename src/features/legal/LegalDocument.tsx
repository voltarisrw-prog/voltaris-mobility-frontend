'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUp, Check, ChevronDown, Copy, Link2, Printer, Search } from 'lucide-react';
import './legal.css';

interface Section {
  heading: string;
  body: string;
}

interface Props {
  crumbs: ReactNode;
  title: string;
  intro: string;
  /** ISO date, e.g. 2026-08-25 */
  updated: string;
  path: '/legal/privacy' | '/legal/terms';
  sections: readonly Section[];
  /** Sentences quoted word for word from a section; a card is shown only if the sentence is still there. */
  keyPoints: { section: string; text: string }[];
  contact: { label: string; email: string };
}

const LINKS = [
  { href: '/legal/privacy', label: 'Privacy policy' },
  { href: '/legal/terms', label: 'Terms of service' },
] as const;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const pad = (n: number) => String(n + 1).padStart(2, '0');

function mark(text: string, q: string): ReactNode {
  if (!q) return text;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  return text.split(re).map((part, i) => (i % 2 === 1 ? <mark key={i}>{part}</mark> : part));
}

export function LegalDocument({ crumbs, title, intro, updated, path, sections, keyPoints, contact }: Props) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [showTop, setShowTop] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const other = LINKS.find((l) => l.href !== path)!;
  const ids = useMemo(() => sections.map((s) => slug(s.heading)), [sections]);
  const words = useMemo(
    () => sections.reduce((n, s) => n + `${s.heading} ${s.body}`.split(/\s+/).length, intro.split(/\s+/).length),
    [sections, intro],
  );
  const minutes = Math.max(1, Math.ceil(words / 200));
  const dateText = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(`${updated}T00:00:00`),
  );

  const qn = q.trim().toLowerCase();
  const hits = sections.map((s) => !qn || s.heading.toLowerCase().includes(qn) || s.body.toLowerCase().includes(qn));
  const hitCount = hits.filter(Boolean).length;

  const titleWords = title.split(' ');
  const accent = titleWords.pop() ?? '';

  const cards = keyPoints
    .map((k) => ({ ...k, index: sections.findIndex((s) => s.heading === k.section && s.body.includes(k.text)) }))
    .filter((k) => k.index >= 0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Reading progress, per-section progress lines, scroll-spy, back-to-top, heading width.
  useEffect(() => {
    const secs = Array.from(document.querySelectorAll<HTMLElement>('.lg-sx'));
    let raf = 0;
    let act = -1;
    const tick = () => {
      raf = 0;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      barRef.current?.style.setProperty('--rp', String(max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0));
      setShowTop(y > 700);
      let a = 0;
      secs.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        s.style.setProperty('--p', String(Math.min(Math.max((vh * 0.6 - r.top) / r.height, 0), 1)));
        if (r.top < vh * 0.38) a = i;
      });
      if (a !== act) {
        act = a;
        setActive(a);
      }
      const h = h1Ref.current;
      if (h && window.innerWidth >= 700) {
        const r = h.getBoundingClientRect();
        const p = Math.min(Math.max((vh * 0.98 - r.top) / (vh * 0.5), 0), 1);
        h.style.setProperty('--wd', (92 + 33 * p).toFixed(1));
      }
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      cancelAnimationFrame(raf);
    };
  }, [sections.length]);

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
        setQ('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function say(message: string) {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 1900);
  }

  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* the toast still confirms the action when the clipboard is blocked */
    }
    say(message);
  }

  function goTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
    setTocOpen(false);
  }

  const toc = (cls: string) => (
    <ol className={cls}>
      {sections.map((s, i) => (
        <li key={ids[i]} className={hits[i] ? undefined : 'is-dim'}>
          <a
            href={`#${ids[i]}`}
            className={active === i ? 'is-on' : undefined}
            aria-current={active === i ? 'location' : undefined}
            onClick={(e) => {
              e.preventDefault();
              goTo(ids[i]!);
            }}
          >
            <i>{pad(i)}</i>
            {s.heading}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="lg-w">
      <div className="lg-bar lg-noprint" ref={barRef} aria-hidden="true" />
      {crumbs}

      <nav className="lg-sw lg-noprint" aria-label="Legal documents">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={l.href === path ? 'page' : undefined} className={l.href === path ? 'is-on' : undefined}>
            {l.label}
          </Link>
        ))}
      </nav>

      <h1 className={`lg-h1${ready ? ' is-in' : ''}`} ref={h1Ref}>
        {[...titleWords, accent].map((w, i, all) => (
          <span key={i}>
            <span className="lg-wd">
              <span className={`lg-wi${i === all.length - 1 ? ' lg-ac' : ''}`} style={{ '--k': i } as CSSProperties}>
                {w}
              </span>
            </span>{' '}
          </span>
        ))}
      </h1>

      <div className="lg-meta">
        <span className="lg-chip">
          <i /> Last updated {dateText}
        </span>
        <span className="lg-chip">{minutes} min read</span>
        <button type="button" className="lg-act lg-noprint" onClick={() => window.print()}>
          <Printer size={16} /> Print
        </button>
        <button
          type="button"
          className="lg-act lg-noprint"
          onClick={() => void copy(`${window.location.origin}${path}`, 'Link copied')}
        >
          <Link2 size={16} /> Copy link
        </button>
      </div>

      <p className="lg-lead">{intro}</p>

      {cards.length > 0 && (
        <div className="lg-kp lg-noprint">
          {cards.map((k) => (
            <button
              key={k.text}
              type="button"
              className="lg-kc"
              onClick={() => goTo(ids[k.index]!)}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--gx', `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty('--gy', `${e.clientY - r.top}px`);
              }}
            >
              <small>{k.section}</small>
              <b>{k.text}</b>
              <span>Read this section →</span>
            </button>
          ))}
        </div>
      )}

      <div className="lg-lay">
        <aside className="lg-toc lg-noprint" aria-label="On this page">
          <div className="lg-q">
            <Search size={18} aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find in this page"
              autoComplete="off"
              aria-label="Find in this page"
            />
            <kbd>/</kbd>
          </div>
          <p className="lg-qc" aria-live="polite">
            {qn ? `${hitCount} ${hitCount === 1 ? 'section matches' : 'sections match'}` : ''}
          </p>
          {toc('lg-tl')}
        </aside>

        <div>
          <div className={`lg-tocm lg-noprint${tocOpen ? ' is-open' : ''}`}>
            <button type="button" aria-expanded={tocOpen} onClick={() => setTocOpen((o) => !o)}>
              <span>
                <small>{pad(active)}</small>
                {sections[active]?.heading}
              </span>
              <ChevronDown size={18} />
            </button>
            <div className="lg-lst">{toc('lg-tl2')}</div>
          </div>

          <div className="lg-doc">
            {sections.map((s, i) => (
              <article key={ids[i]} id={ids[i]} className={`lg-sx${hits[i] ? '' : ' is-dim'}`}>
                <span className="lg-sn" aria-hidden="true">
                  {pad(i)}
                </span>
                <h2>
                  {mark(s.heading, qn)}
                  <button
                    type="button"
                    className="lg-cl lg-noprint"
                    aria-label={`Copy link to ${s.heading}`}
                    onClick={() => void copy(`${window.location.origin}${path}#${ids[i]}`, 'Link copied')}
                  >
                    <Link2 size={18} />
                  </button>
                </h2>
                <p>{mark(s.body, qn)}</p>
              </article>
            ))}
            {qn && hitCount === 0 && <p className="lg-none">No section mentions that. Try another word, or clear the search.</p>}
          </div>

          <div className="lg-endc lg-noprint">
            <div className="lg-ec">
              <div>
                <small>{contact.label}</small>
                <a className="lg-m" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </div>
              <button
                type="button"
                className={`lg-cp${copied ? ' is-ok' : ''}`}
                aria-label={`Copy ${contact.email}`}
                onClick={() => {
                  void copy(contact.email, `Copied ${contact.email}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1600);
                }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <Link href={other.href} className="lg-ec lg-nx">
              <div>
                <small>Also read</small>
                <b>{other.label}</b>
              </div>
              <span className="lg-ar">
                <ArrowRight size={22} strokeWidth={2.4} />
              </span>
            </Link>
          </div>
        </div>
      </div>

      <button type="button" className={`lg-top lg-noprint${showTop ? ' is-on' : ''}`} aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <ArrowUp size={22} strokeWidth={2.4} />
      </button>
      <div className={`lg-toast lg-noprint${toast ? ' is-on' : ''}`} role="status">
        {toast}
      </div>
    </div>
  );
}
