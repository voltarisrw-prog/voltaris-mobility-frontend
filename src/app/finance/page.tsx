
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildMetadata } from '@/lib/seo/metadata';
import { getVehicleBySlug } from '@/lib/api/vehicles';
import { financeDefaults } from '@/config/finance';
import { FinanceCalculator } from '@/features/finance/FinanceCalculator';
import '@/features/finance/finance.css';

export const metadata: Metadata = buildMetadata({
  title: 'Car finance calculator — electric and hybrid vehicles in Rwanda',
  description:
    'See your indicative monthly payment in seconds. Adjust deposit, term and rate; compare Bank of Kigali, I&M and Unguka; apply through Voltaris with one form.',
  path: '/finance',
});

export const dynamic = 'force-dynamic';

const CURVE = 'M0 40C320 40 520 170 820 250S1100 290 1200 296';

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const slug = typeof params.vehicle === 'string' ? params.vehicle : undefined;
  const priceParam =
    typeof params.price === 'string'
      ? Number(params.price.replace(/\D/g, ''))
      : NaN;

  let initialPrice =
    Number.isFinite(priceParam) && priceParam > 0
      ? priceParam
      : financeDefaults.fallbackPriceRwf;

  let vehicleLabel: string | undefined;

  if (slug) {
    try {
      const v = await getVehicleBySlug(slug);

      if (v.price !== null) initialPrice = v.price;

      vehicleLabel = `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}`;
    } catch {
      // Unknown slug: fall through to the default price; the calculator still works.
    }
  }

  return (
    <div className="fc-page">
      <div className="fc-curve" aria-hidden="true">
        <svg viewBox="0 0 1200 320" preserveAspectRatio="none">
          <defs>
            <linearGradient id="fc-cg" x1="0" y1="0" x2="1" y2="0">
              <stop stopColor="#7fd4ff" />
              <stop offset="1" stopColor="#12d6b0" />
            </linearGradient>
          </defs>
          <path className="b" d={CURVE} />
          <path className="p" d={CURVE} />
        </svg>
      </div>

      <div className="fc-w">
        <Breadcrumbs
          trail={[
            { name: 'Home', path: '/' },
            { name: 'Finance', path: '/finance' },
          ]}
        />

        <p className="fc-eb">Car finance</p>

        <h1 className="fc-h1">
          What would it cost per <em>month?</em>
        </h1>

        <FinanceCalculator
          initialPrice={initialPrice}
          vehicleLabel={vehicleLabel}
          vehicleSlug={slug}
        />
      </div>
    </div>
  );
}
