import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo/metadata';
import { getVehicleBySlug } from '@/lib/api/vehicles';
import { financeDefaults } from '@/config/finance';
import { FormWide } from '@/features/forms/FormWide';
import { FinanceCalculator } from '@/features/finance/FinanceCalculator';

export const metadata: Metadata = buildMetadata({
  title: 'Car finance calculator — electric and hybrid vehicles in Rwanda',
  description:
    'See your indicative monthly payment in seconds. Adjust deposit, term and rate; compare Bank of Kigali, I&M and Unguka; apply through Voltaris with one form.',
  path: '/finance',
});

export const dynamic = 'force-dynamic';

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const slug = typeof params.vehicle === 'string' ? params.vehicle : undefined;
  const priceParam = typeof params.price === 'string' ? Number(params.price.replace(/\D/g, '')) : NaN;

  let initialPrice = Number.isFinite(priceParam) && priceParam > 0 ? priceParam : financeDefaults.fallbackPriceRwf;
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
    <FormWide
      crumb="Finance"
      title="What would it cost per month?"
      intro="Move the sliders. The number updates as you go. When it looks right, send it to an advisor and we take it to the bank with you."
    >
      <FinanceCalculator initialPrice={initialPrice} vehicleLabel={vehicleLabel} vehicleSlug={slug} />
    </FormWide>
  );
}
