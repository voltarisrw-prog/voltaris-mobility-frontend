import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SellerListingFlow } from '@/features/sellers/SellerListingFlow';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Sell your electric vehicle in Rwanda',
  description:
    'List your EV on Voltaris. Submit the vehicle, photos, and documents; we verify what we can and put it in front of buyers already searching for it.',
  path: '/sell',
});

export default function SellPage() {
  return (
    <div className="shell py-10">
      <Breadcrumbs
        trail={[
          { name: 'Home', path: '/' },
          { name: 'List your EV', path: '/sell' },
        ]}
      />

      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <h1 className="font-display text-headline">List your EV</h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-steel">
            Four steps, about ten minutes. Nothing goes live until a reviewer has checked it.
          </p>
          <div className="mt-10">
            <SellerListingFlow />
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-hairline p-6">
            <h2 className="eyebrow">What happens next</h2>
            <ol className="mt-4 space-y-4 text-sm text-steel">
              <li>
                <span className="font-display font-semibold text-chrome">Review.</span> A Voltaris
                reviewer checks your documents and photos, usually within two working days.
              </li>
              <li>
                <span className="font-display font-semibold text-chrome">Verification.</span> Where we
                can, we confirm ownership, import status, and battery health.
              </li>
              <li>
                <span className="font-display font-semibold text-chrome">Price.</span> We agree the
                listed price with you. Your figure is the starting point.
              </li>
              <li>
                <span className="font-display font-semibold text-chrome">Live.</span> Buyers enquire
                and book test drives through Voltaris; we pass qualified leads to you.
              </li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
