import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { VoltarisLogo } from './VoltarisLogo';
import { SocialLinks } from './SocialLinks';
import { credits, footerColumns } from '@/content/home';
import { site } from '@/config/site';

export function SiteFooter() {
  return (
    <footer className="relative mt-28 overflow-hidden border-t border-hairline">
      <div className="shell py-24 sm:py-32 lg:py-40">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)] lg:gap-24">
          <div>
            <p className="eyebrow">Voltaris Mobility</p>

            <h2 className="mt-6 max-w-4xl font-display text-[clamp(3.5rem,8vw,7.5rem)] font-semibold leading-[0.82] tracking-[-0.065em]">
              Keep moving.
            </h2>

            <p className="mt-7 max-w-md text-base leading-relaxed text-steel sm:text-lg">
              Everything worth driving, in one place. Vehicles are supplied by dealers,
              owners, and mobility partners; Voltaris checks them.
            </p>

            <div className="mt-9">
              <SocialLinks className="flex flex-wrap gap-1" />
            </div>
          </div>

          <nav aria-label="Footer navigation">
            <div className="grid gap-10 sm:grid-cols-2">
              {footerColumns.map((column) => (
                <div key={column.heading}>
                  <h2 className="eyebrow mb-5">{column.heading}</h2>

                  <ul className="space-y-3">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group inline-flex items-center gap-2 font-display text-lg font-medium tracking-tight text-steel transition-colors hover:text-chrome sm:text-xl"
                        >
                          <span>{link.label}</span>
                          <ArrowUpRight
                            className="h-3.5 w-3.5 -translate-x-1 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        </div>

        <div className="mt-24 border-t border-hairline pt-8 sm:mt-32 sm:pt-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <VoltarisLogo className="h-8" />

            <div className="max-w-xl text-sm leading-relaxed text-steel-muted lg:text-right">
              <p>
                Built for Rwanda. Designed around the way people actually discover,
                compare, buy, rent, and sell vehicles.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="shell flex flex-col gap-3 py-6 font-data text-xs text-steel-muted sm:flex-row sm:items-center sm:justify-between">
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

      <div className="h-16 lg:hidden" aria-hidden="true" />
    </footer>
  );
}
