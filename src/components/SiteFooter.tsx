'use client';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { site } from '@/config/site';
import { socialLinks } from '@/content/home';
import s from './site-footer.module.css';

const groups = [
  {
    heading: 'Discover',
    links: [
      { label: 'Cars', href: '/cars' },
      { label: 'Brands', href: '/brands' },
      { label: 'Dealers', href: '/dealers' },
      { label: 'Compare', href: '/compare' },
      { label: 'Charging', href: '/charging' },
      { label: 'Test drive', href: '/test-drive' },
    ],
  },
  {
    heading: 'Buy and sell',
    links: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Finance calculator', href: '/finance' },
      { label: 'Book a garage', href: '/garage' },
      { label: 'Sell a vehicle', href: '/sell' },
      { label: 'Trust and verification', href: '/trust-and-verification' },
      { label: 'Guides', href: '/guides' },
      { label: 'Help', href: '/help' },
    ],
  },
  {
    heading: 'Explore',
    links: [
      { label: 'Electric cars in Kigali', href: '/electric-cars-kigali' },
      { label: 'Electric cars in Rwanda', href: '/electric-cars-rwanda' },
      { label: 'Electric SUVs', href: '/electric-suvs-rwanda' },
      { label: 'Electric sedans', href: '/electric-sedans-rwanda' },
      { label: 'Used electric cars', href: '/used-electric-cars-rwanda' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    heading: 'Voltaris',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy', href: '/legal/privacy' },
      { label: 'Terms', href: '/legal/terms' },
    ],
  },
];

const social = [
  {
    key: 'instagram',
    label: 'Instagram',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r=".8" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5 21v-7.5H16l.5-3h-3V8.7c0-.9.3-1.5 1.6-1.5h1.5V4.5c-.3 0-1.2-.1-2.2-.1-2.3 0-3.9 1.4-3.9 4v2.1H8v3h2.5V21z" />
      </svg>
    ),
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="6.2" cy="6.5" r="1.7" />
        <rect x="4.7" y="9.3" width="3" height="9.5" />
        <path d="M10 9.3h2.9v1.3c.5-.9 1.6-1.6 3-1.6 3 0 3.6 2 3.6 4.5v5.3h-3v-4.7c0-1.1-.2-2.1-1.5-2.1s-2 .9-2 2.1v4.7H10z" />
      </svg>
    ),
  },
  {
    key: 'x',
    label: 'X',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4l6.8 9.2L4.2 20H6l5.6-5.8L16 20h4l-7.1-9.6L19.2 4h-1.8l-5 5.2L8.5 4z" />
      </svg>
    ),
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      >
        <path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4.1A8 8 0 1 1 20 12z" />
      </svg>
    ),
  },
].filter((p) => socialLinks[p.key]);

// The design's display weights. Scoped to the footer: the site's own Inter stays 400–600.
const heavy = Inter({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-inter-heavy',
  display: 'swap',
});

const kigali = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Kigali',
});

/**
 * Site footer — built 1:1 from the approved design ("Voltaris Mobility – Footer"),
 * with the design's green replaced by blues from the logo. Styles live in
 * site-footer.module.css; layout follows the footer's own width (container queries).
 */
export function SiteFooter() {
  const wrap = useRef<HTMLDivElement>(null);
  const ft = useRef<HTMLElement>(null);
  const wide = useRef<boolean | null>(null);
  const gradient = `vft-${useId().replace(/:/g, '')}`;
  const [on, setOn] = useState(false);
  const [cells, setCells] = useState(0);
  const [clock, setClock] = useState('');

  // Columns open on wide screens, an accordion on phones.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const sync = () => {
      const w = el.clientWidth > 560;
      if (w === wide.current) return;
      wide.current = w;
      el.querySelectorAll('details').forEach((d) => {
        d.open = w;
      });
    };
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, []);

  // Kigali clock.
  useEffect(() => {
    const tick = () => setClock(`· ${kigali.format(new Date())}`);
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);

  // Charge up when the footer arrives.
  useEffect(() => {
    const el = ft.current;
    if (!el) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        setOn(true);
        let n = 0;
        const step = () => {
          if (n >= 10) return;
          n += 1;
          setCells(n);
          timer = setTimeout(step, reduce ? 0 : 130);
        };
        step();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Cursor light.
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <div ref={wrap} className={`${s.wrap} ${heavy.variable}`} data-site-footer="">
      <footer ref={ft} className={s.ft} data-on={on ? '' : undefined} onPointerMove={onPointerMove}>
        <div className={`${s.blob} ${s.b1}`} />
        <div className={`${s.blob} ${s.b2}`} />
        <div className={s.spot} />
        <div className={s.in}>
          <div className={s.hero}>
            <div>
              <h2>
                Charge into your <em>next car.</em>
              </h2>
              <p>
                Verified electric and hybrid cars, compared side by side and ready for a free demo
                drive in Kigali.
              </p>
              <div className={s.charge} aria-hidden="true">
                <div className={s.cells}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <i key={i} data-on={i < cells ? '' : undefined} />
                  ))}
                </div>
                <span className={s.pct} data-full={cells === 10 ? '' : undefined}>
                  {cells === 10 ? 'Fully charged' : `Charging ${cells * 10}%`}
                </span>
              </div>
            </div>
            <div className={s.act}>
              <Link className={s.b} href="/cars">
                Browse cars <span>→</span>
              </Link>
              <Link className={`${s.b} ${s.g}`} href="/test-drive">
                Book a test drive <span>→</span>
              </Link>
            </div>
          </div>

          <div className={s.main}>
            <div className={s.brand}>
              <Link className={s.logo} href="/" aria-label="Voltaris Mobility home">
                <svg width="36" height="36" viewBox="0 0 32 32" aria-hidden="true">
                  <defs>
                    <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
                      <stop stopColor="#7fd4ff" />
                      <stop offset="1" stopColor="#3aa8ff" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M3 5l10 22h2L19 12"
                    fill="none"
                    stroke={`url(#${gradient})`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M29 5L19 27"
                    fill="none"
                    stroke="#f3f5fa"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>
                  VOLTARIS<small>MOBILITY</small>
                </span>
              </Link>
              <p>Mobility, made simpler.</p>
              <ul className={s.soc}>
                {social.map((p) => (
                  <li key={p.key}>
                    <a
                      href={socialLinks[p.key]}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={p.label}
                    >
                      {p.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {groups.map((group) => (
              <details key={group.heading} className={s.col} open>
                <summary
                  onClick={(e) => {
                    if (wide.current) e.preventDefault();
                  }}
                >
                  <b>{group.heading}</b>
                  <i />
                </summary>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          <div className={s.base}>
            <span className={s.now}>
              Kigali, Rwanda <span suppressHydrationWarning>{clock}</span>
            </span>
            <span>
              © {new Date().getFullYear()} {site.legalName}. All rights reserved.
            </span>
            <span>
              Designed and developed by{' '}
              <a
                href="https://www.linkedin.com/in/patrice-iradukunda-74931827a/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Patrice Iradukunda
              </a>
            </span>
            <span className={s.legal}>
              <Link href="/legal/privacy">Privacy</Link>
              <Link href="/legal/terms">Terms</Link>
            </span>
          </div>
        </div>

        <div className={s.scene} aria-hidden="true">
          <div className={s.glow} />
          <div className={s.road} />
          <div className={s.lights} />
          <div className={s.mark}>
            {'VOLTARIS'.split('').map((ch, i) => (
              <i key={i} style={{ '--d': i } as React.CSSProperties}>
                {ch}
              </i>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
