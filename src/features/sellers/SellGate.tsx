import Link from 'next/link';
import { Lock } from 'lucide-react';
import { SellTicket } from './SellTicket';
import './sell.css';

/** Shown to visitors who are not signed in. Listing needs a Voltaris account. */
export function SellGate() {
  return (
    <div className="sl-grid" id="list">
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
          <p>
            Sign in to your Voltaris account to create a listing. Private owners, dealers and
            businesses are welcome. Saved vehicles, enquiries, and test drives in one place.
          </p>
          <div className="sl-gbt">
            <Link className="sl-btn" href="/login?next=/sell">
              Sign in to list your car
            </Link>
            <Link className="sl-btn sl-gh" href="/register">
              Create an account
            </Link>
          </div>
          <small>New here? Create an account, verify your email, then come back to list your car.</small>
        </div>
      </section>
      <SellTicket badge="Listing" title="" meta={[]} priceLine="Set by Voltaris after review" done={0} total={4} />
    </div>
  );
}
