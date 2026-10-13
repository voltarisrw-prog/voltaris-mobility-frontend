import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { features } from '@/config/features';
import { getSession } from '@/lib/api/auth';
import { buildMetadata } from '@/lib/seo/metadata';
import { homeFonts } from '@/features/home/landing/fonts';
import { SellerListingFlow } from '@/features/sellers/SellerListingFlow';
import { SellGate } from '@/features/sellers/SellGate';
import { SellWaitingList } from '@/features/sellers/SellWaitingList';
import '@/features/sellers/sell.css';

export const metadata: Metadata = buildMetadata({
  title: 'Sell your electric or hybrid car in Rwanda',
  description:
    'List your electric or hybrid vehicle with Voltaris and reach buyers across Rwanda.',
  path: '/sell',
});

// Reads the session cookie, so this page is rendered per visitor.
export const dynamic = 'force-dynamic';

/** The signed-in person's details, or null. A failure to check is treated as signed out, so the page never errors. */
async function currentUser() {
  try {
    const session = await getSession();
    const u = session.user as unknown as Record<string, unknown>;
    const str = (key: string) => (typeof u[key] === 'string' ? (u[key] as string) : undefined);
    return { full_name: str('full_name') ?? str('name'), email: str('email'), phone: str('phone') };
  } catch {
    return null;
  }
}

const POINTS = [
  { Icon: Sparkles, h: 'Make the car stand out.', p: 'Add clear photos and the details buyers actually need.' },
  { Icon: Users, h: 'Private owners welcome.', p: 'You do not need a dealership to list your vehicle.' },
  { Icon: ShieldCheck, h: 'Reviewed before publication.', p: 'Voltaris reviews submitted listings before they go live.' },
] as const;

export default async function SellPage() {
  const user = await currentUser();

  return (
    <div className={`sl-page ${homeFonts}`}>
      <div className="sl-w">
        <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Sell', path: '/sell' }]} />
        <p className="sl-eb">Sell with confidence</p>
        <h1 className="sl-h1">
          <span className="sl-ln">Your car. Your terms.</span>{' '}
          <span className="sl-ln">
            A better <em>sale.</em>
          </span>
        </h1>
        <p className="sl-lead">
          List your electric or hybrid vehicle directly with Voltaris. You do not need to be a dealer.
          Private owners can list too.
        </p>

        {!user ? (
          <SellGate />
        ) : features.sellerListings ? (
          <SellerListingFlow user={user} />
        ) : (
          <div className="sl-wait" id="list">
            <SellWaitingList />
          </div>
        )}

        <ul className="sl-trio">
          {POINTS.map(({ Icon, h, p }) => (
            <li key={h}>
              <span>
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3>{h}</h3>
              <p>{p}</p>
            </li>
          ))}
        </ul>

        <section className="sl-final">
          <h2>
            When you are ready, <em>put your car in the room.</em>
          </h2>
          <Link href="#list" className="sl-big">
            Start listing
            <span>
              <ArrowRight size={24} strokeWidth={2.4} />
            </span>
          </Link>
        </section>
      </div>
    </div>
  );
}
