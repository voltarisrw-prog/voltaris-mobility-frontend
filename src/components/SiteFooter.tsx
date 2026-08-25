import Link from 'next/link';
import { VoltarisLogo } from './VoltarisLogo';
import { SocialLinks } from './SocialLinks';
import { credits, footerColumns } from '@/content/home';
import { site } from '@/config/site';

/**
 * The footer is also the internal-linking layer — the crawl path to every category
 * and editorial page. These links are structural, not decorative.
 */
export function SiteFooter() {
  return (
    <footer className="mt-28 border-t border-hairline panel-deep">
      <div className="shell py-16">
        <div className="grid gap-12 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <div>
            <VoltarisLogo className="h-10" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-steel">
              Everything worth driving, in one place. Vehicles are supplied by dealers, owners, and
              mobility partners; Voltaris checks them.
            </p>
            <SocialLinks className="mt-6 flex flex-wrap gap-1" />
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.heading}>
                <h2 className="eyebrow mb-4">{column.heading}</h2>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-steel transition-colors hover:text-volt">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="shell flex flex-col gap-2 py-6 font-data text-xs text-steel-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}. Kigali, Rwanda.
          </p>
          <p>
            {credits.people.map((person, index) => (
              <span key={person.name}>
                {index > 0 && ' · '}
                {person.role} by{' '}
                {person.url ? (
                  <a
                    href={person.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-steel transition-colors hover:text-volt"
                  >
                    {person.name}
                  </a>
                ) : (
                  <span className="text-steel">{person.name}</span>
                )}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* Clears the fixed mobile bottom bar so the last link is never trapped under it. */}
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </footer>
  );
}
