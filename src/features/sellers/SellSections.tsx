import Image from 'next/image';
import { ArrowRight, Camera, Car, ShieldCheck, Tag, User } from 'lucide-react';

const STEPS = [
  { Icon: User, label: 'About you' },
  { Icon: Car, label: 'The vehicle' },
  { Icon: Camera, label: 'Photos' },
  { Icon: Tag, label: 'Price' },
  { Icon: ShieldCheck, label: 'Reviewed, then live' },
] as const;

/** Five labels, no sentences. */
export function SellSteps() {
  return (
    <ol className="sl-strip" aria-label="How listing works">
      {STEPS.map(({ Icon, label }, i) => (
        <li key={label}>
          <span>
            <Icon size={20} aria-hidden="true" />
          </span>
          <b>{label}</b>
          {i < STEPS.length - 1 && <i aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

const PHOTOS = [
  { src: '/demo/lifestyle/ev-lineup.jpg', alt: 'A line of electric vehicles' },
  { src: '/demo/lifestyle/driving-pov-palms.jpg', alt: 'Driving past palm trees' },
  { src: '/demo/lifestyle/family-home-charging.jpg', alt: 'A family charging at home' },
  { src: '/demo/lifestyle/villa-sunset-charging.jpg', alt: 'Charging a car at sunset' },
] as const;

/** Pure imagery, so the page is never a wall of words. */
export function SellMosaic() {
  return (
    <div className="sl-mosaic">
      {PHOTOS.map((p, i) => (
        <figure key={p.src} className={`sl-m sl-m${i + 1}`}>
          <Image src={p.src} alt={p.alt} fill sizes="(min-width: 900px) 40vw, 50vw" />
        </figure>
      ))}
    </div>
  );
}

export function SellFinal() {
  return (
    <section className="sl-final">
      <Image src="/hero/gallery/hero-05.jpeg" alt="" fill sizes="100vw" className="sl-fim" />
      <h2>
        Put your car <em>in the room.</em>
      </h2>
      <a href="#list" className="sl-big">
        Start listing
        <span>
          <ArrowRight size={24} strokeWidth={2.4} />
        </span>
      </a>
    </section>
  );
}
