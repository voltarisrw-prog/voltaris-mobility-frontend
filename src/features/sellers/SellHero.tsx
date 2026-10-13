import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const GALLERY = [
  '/hero/gallery/hero-01.png',
  '/hero/gallery/hero-02.png',
  '/hero/gallery/hero-03.png',
  '/hero/gallery/hero-04.png',
  '/hero/gallery/hero-05.jpeg',
] as const;

const GOALS = [
  { href: '#list-sell', title: 'Sell it', line: 'Reach buyers across Rwanda', img: '/next/sell.png' },
  { href: '#list-rent', title: 'Rent it out', line: 'Let drivers rent it', img: '/next/rent.png' },
] as const;

/** Heading first, then the two ways in. Photos do the talking. */
export function SellHero() {
  return (
    <header className="sl-hero">
      <div className="sl-gal" aria-hidden="true">
        {GALLERY.map((src, i) => (
          <Image key={src} src={src} alt="" fill priority={i === 0} sizes="100vw" className="sl-gi" />
        ))}
      </div>
      <div className="sl-shade" aria-hidden="true" />
      <div className="sl-w sl-hw">
        <h1 className="sl-h1">
          <span className="sl-ln">Your car. Your terms.</span>{' '}
          <span className="sl-ln sl-dim">
            A better <em>sale.</em>
          </span>
        </h1>
        <p className="sl-subline">Private owners welcome.</p>

        <div className="sl-goals">
          {GOALS.map((g) => (
            <a key={g.href} href={g.href} className="sl-gc">
              <span className="sl-gim">
                <Image src={g.img} alt="" fill sizes="(min-width: 900px) 45vw, 100vw" />
              </span>
              <span className="sl-gt">
                <b>{g.title}</b>
                <small>{g.line}</small>
              </span>
              <span className="sl-garr" aria-hidden="true">
                <ArrowRight size={24} strokeWidth={2.2} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
