'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { SellGate } from './SellGate';
import { SellerListingFlow } from './SellerListingFlow';
import type { Goal, SellerUser } from './sell-types';
import './sell.css';

/**
 * The listing section. The hero cards link here with #list-sell or #list-rent,
 * which sets the choice, and the switch below lets people change their mind.
 */
export function SellStage({ user, open, waiting }: { user: SellerUser | null; open: boolean; waiting: ReactNode }) {
  const [goal, setGoal] = useState<Goal>('sell');

  useEffect(() => {
    const read = () => {
      const h = window.location.hash;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (h === '#list-rent') setGoal('rent');
      else if (h === '#list-sell') setGoal('sell');
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  return (
    <section className="sl-sec" id="list" aria-labelledby="sl-list-h">
      <span id="list-sell" className="sl-anchor" />
      <span id="list-rent" className="sl-anchor" />
      <div className="sl-hd">
        <div>
          <p className="sl-eb">Your listing</p>
          <h2 className="sl-sh" id="sl-list-h">
            Tell us about <em>your car.</em>
          </h2>
        </div>
        <div className="sl-seg" role="radiogroup" aria-label="Sell or rent">
          {([['sell', 'Sell it'], ['rent', 'Rent it out']] as const).map(([v, l]) => (
            <button key={v} type="button" role="radio" aria-checked={goal === v} className={goal === v ? 'is-on' : ''} onClick={() => setGoal(v)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {!user ? <SellGate goal={goal} /> : open ? <SellerListingFlow user={user} goal={goal} /> : <div className="sl-wait">{waiting}</div>}
    </section>
  );
}
