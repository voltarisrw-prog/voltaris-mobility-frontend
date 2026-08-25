import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getFacets } from '@/lib/api/vehicles';
import { buildMetadata } from '@/lib/seo/metadata';

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

  return (
    <div className="shell py-10">
      <Breadcrumbs
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Brands', path: '/brands' },
        ]}
      />
      <h1 className="mt-6 font-display text-headline">Brands listed in Rwanda</h1>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-steel">
        Which manufacturers actually have cars on the ground here, and how many.
      </p>

      {makes.length === 0 ? (
        <p className="mt-10 border border-dashed border-hairline p-8 text-center text-sm text-steel">
          Brand data is loading from the marketplace service.
        </p>
      ) : (
        <ul className="mt-10 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {makes.map((make) => (
            <li key={make.value} className="panel">
              <Link
                href={`/brands/${make.value}`}
                className="flex items-baseline justify-between p-5 transition-colors hover:bg-volt-wash"
              >
                <span className="font-display text-base font-semibold tracking-tight">
                  {make.label}
                </span>
                <span className="font-data text-xs tabular-nums text-steel-muted">
                  {make.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
