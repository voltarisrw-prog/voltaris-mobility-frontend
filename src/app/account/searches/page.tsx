import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { getSavedSearches } from '@/lib/api/users';

export default async function SavedSearchesPage() {
  const searches = await getSavedSearches();
  return (
    <section>
      <h2 className="font-display text-xl font-semibold tracking-tight">Saved searches</h2>
      <p className="mt-2 text-sm text-steel">
        We check new listings against these and email you when something matches.
      </p>
      <div className="mt-8">
        {searches.length === 0 ? (
          <EmptyState
            title="No saved searches"
            body="Set filters on the marketplace, then save them. When a matching EV is listed, you hear about it first."
            action={{ label: 'Set up a search', href: '/cars' }}
          />
        ) : (
          <ul className="divide-y divide-hairline/60 border-y border-hairline/60">
            {searches.map((search) => (
              <li key={search.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <Link
                    href={`/cars?${search.query}`}
                    className="font-display text-sm font-semibold tracking-tight hover:text-volt"
                  >
                    {search.label}
                  </Link>
                  <p className="mt-1 font-data text-xs text-steel-muted">
                    {search.alerts_enabled ? 'Alerts on' : 'Alerts off'}
                  </p>
                </div>
                <Link
                  href={`/cars?${search.query}`}
                  className="font-data text-eyebrow uppercase text-volt hover:underline"
                >
                  Run it →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
