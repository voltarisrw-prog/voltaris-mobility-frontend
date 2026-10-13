import Image from 'next/image';
import { Check } from 'lucide-react';

interface Props {
  badge: string;
  title: string;
  meta: string[];
  photo?: string | undefined;
  priceLine: string;
  done: number;
  total: number;
  stamped?: boolean;
}

/** The live "how your car will be described" card. Presentational only, so the sign-in gate can show it empty. */
export function SellTicket({ badge, title, meta, photo, priceLine, done, total, stamped = false }: Props) {
  const C = 2 * Math.PI * 22;
  return (
    <aside className="sl-pv" data-sent={stamped} aria-label="Your listing preview">
      <div className="sl-pvh">
        <div>
          <small>Your</small>
          <h3>Listing</h3>
        </div>
        <div className="sl-rg" aria-label={`${done} of ${total} steps complete`}>
          <svg viewBox="0 0 52 52" aria-hidden="true">
            <circle className="a" cx="26" cy="26" r="22" />
            <circle className="b" cx="26" cy="26" r="22" style={{ strokeDasharray: C, strokeDashoffset: C * (1 - done / total) }} />
          </svg>
          <span>
            {done}/{total}
          </span>
        </div>
      </div>
      <div className="sl-lc">
        <div className="sl-lci">
          {photo ? (
            <Image src={photo} alt="Cover photo preview" fill unoptimized sizes="(min-width: 980px) 28vw, 90vw" className="object-cover" />
          ) : (
            <svg viewBox="0 0 600 200" aria-hidden="true">
              <path d="M30 140C34 112 54 98 92 92L172 56C214 36 320 30 396 40C440 46 470 60 500 82L548 92C572 98 580 116 580 140V150H30Z" fill="#cdd5ea" />
              <path d="M196 62C250 44 340 44 392 54L440 92H170Z" fill="#0b1226" opacity=".9" />
              <circle cx="150" cy="152" r="32" fill="#04060d" />
              <circle cx="462" cy="152" r="32" fill="#04060d" />
            </svg>
          )}
          <span className="sl-lcb">{badge}</span>
        </div>
        <div className="sl-lcc">
          <h4 className={title ? '' : 'is-e'}>{title || 'Your car'}</h4>
          <div className="sl-lcm">
            {meta.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
          <div className="sl-lcp">
            <span>Price</span>
            <b>{priceLine}</b>
          </div>
        </div>
        <span className="sl-stamp">
          <Check size={14} strokeWidth={3} /> Sent
        </span>
      </div>
      <p className="sl-hint">Voltaris reviews every listing before it goes live.</p>
    </aside>
  );
}
