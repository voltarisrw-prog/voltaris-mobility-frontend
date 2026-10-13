import type { Metadata } from 'next';
import { features } from '@/config/features';
import { getSession } from '@/lib/api/auth';
import { buildMetadata } from '@/lib/seo/metadata';
import { homeFonts } from '@/features/home/landing/fonts';
import { SellHero } from '@/features/sellers/SellHero';
import { SellFinal, SellMosaic, SellSteps } from '@/features/sellers/SellSections';
import { SellStage } from '@/features/sellers/SellStage';
import { SellWaitingList } from '@/features/sellers/SellWaitingList';
import '@/features/sellers/sell.css';

export const metadata: Metadata = buildMetadata({
  title: 'Sell or rent out your electric or hybrid car in Rwanda',
  description:
    'List your electric or hybrid vehicle with Voltaris to sell it or rent it out, and reach people across Rwanda.',
  path: '/sell',
});

// Reads the session cookie, so this page is rendered per visitor.
export const dynamic = 'force-dynamic';

/** The signed-in person's details, or null. A failure to check counts as signed out, so the page never errors. */
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

export default async function SellPage() {
  const user = await currentUser();

  return (
    <div className={`sl-page ${homeFonts}`}>
      <SellHero />
      <div className="sl-w">
        <SellSteps />
        <SellStage user={user} open={features.sellerListings} waiting={<SellWaitingList />} />
        <SellMosaic />
        <SellFinal />
      </div>
    </div>
  );
}
