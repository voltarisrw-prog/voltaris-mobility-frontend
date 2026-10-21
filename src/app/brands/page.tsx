import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BrandsExplorer, type BrandCardData } from '@/features/brands/BrandsExplorer';
import { homeFonts } from '@/features/home/landing/fonts';
import { brandLogos } from '@/content/brands';
import { getFacets } from '@/lib/api/vehicles';
import { buildMetadata } from '@/lib/seo/metadata';
import '@/features/brands/brands.css';

export const metadata: Metadata = buildMetadata({
  title: 'Electric vehicle brands in Rwanda',
  description:
    'Every EV manufacturer with vehicles listed in Rwanda on Voltaris, with the number of cars currently available from each.',
  path: '/brands',
});

export default async function BrandsPage() {
  let makes: { value: string; label: string; count: number }[] = [];
  try {
    makes = (await getFacets()).makes;
  } catch {
    // Rendered as an empty directory rather than an error page.
  }

  const brands: BrandCardData[] = makes.map((m) => ({
    value: m.value,
    label: m.label,
    count: m.count,
    logo: brandLogos[m.value] ?? null,
  }));

  return (
    <div className={`br-page ${homeFonts}`}>
      <div className="br-w">
        <Breadcrumbs
          trail={[
            { name: 'Home', path: '/' },
            { name: 'Brands', path: '/brands' },
          ]}
        />
        <h1 className="br-h1">
          <span className="br-wd">
            <span className="br-wi">
              Brands listed in <em>Rwanda</em>
            </span>
          </span>
        </h1>
        <p className="br-lead">Which manufacturers actually have cars on the ground here, and how many.</p>

        <BrandsExplorer
          brands={brands}
          empty={
            <p className="br-note">Brand data is loading from the marketplace service.</p>
          }
        />
      </div>
    </div>
  );
}
