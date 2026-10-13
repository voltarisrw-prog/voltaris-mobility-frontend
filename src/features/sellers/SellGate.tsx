import Link from 'next/link';
import { Lock } from 'lucide-react';
import { SellTicket } from './SellTicket';
import type { Goal } from './sell-types';

/** Shown to visitors who are not signed in. Listing needs a Voltaris account. */
export function SellGate({ goal }: { goal: Goal }) {
  return (
    <div className="sl-grid">
      <section className="sl-card sl-gate" aria-label="Sign in to list your car">
        <div className="sl-sk" aria-hidden="true">
          <i />
          <div>
            <i />
            <i />
          </div>
          <i />
        </div>
        <div className="sl-ov">
          <span className="sl-lock">
            <Lock size={28} strokeWidth={2.2} />
          </span>
          <h2>Sign in to list your car</h2>
          <p>Private owners, dealers and businesses are welcome.</p>
          <div className="sl-gbt">
            <Link className="sl-btn" href="/login?next=/sell">
              Sign in
            </Link>
            <Link className="sl-btn sl-gh" href="/register">
              Create an account
            </Link>
          </div>
        </div>
      </section>
      <SellTicket badge={goal === 'rent' ? 'Rent it out' : 'Sell it'} title="" meta={[]} priceLine="Set by Voltaris after review" done={0} total={4} />
    </div>
  );
}
