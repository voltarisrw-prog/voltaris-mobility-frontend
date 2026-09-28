import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';
import { getVehicleBySlug } from '@/lib/api/vehicles';
import { financeDefaults } from '@/config/finance';
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
    <div className="shell py-14 sm:py-20">
      <nav aria-label="Breadcrumb" className="font-data text-xs uppercase tracking-[0.12em] text-steel-muted">
        <Link href="/" className="hover:text-chrome">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-chrome">Finance</span>
      </nav>

      <header className="mt-6 max-w-2xl">
        <p className="eyebrow">Car finance</p>
        <h1 className="mt-3 font-display text-hero text-chrome">What would it cost per month?</h1>
        <p className="mt-4 text-base leading-relaxed text-steel">
          Move the sliders. The number updates as you go. When it looks right, send it to an advisor
          and we take it to the bank with you.
        </p>
      </header>

      <div className="mt-12 sm:mt-16">
        <FinanceCalculator initialPrice={initialPrice} vehicleLabel={vehicleLabel} vehicleSlug={slug} />
      </div>
    </div>
  );
}
