import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { VoltarisLogo } from './VoltarisLogo';
import { SocialLinks } from './SocialLinks';
import { credits, footerColumns } from '@/content/home';
import { site } from '@/config/site';

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-hairline bg-surface">
      <div className="shell py-20 sm:py-24 lg:py-32 xl:py-36">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:gap-20 xl:gap-28">
          <div className="min-w-0">
            <p className="eyebrow">Voltaris Mobility</p>

            <h2 className="mt-6 max-w-5xl font-display text-[clamp(4.25rem,10vw,10rem)] font-medium uppercase leading-[0.76] tracking-[-0.07em] text-chrome">
              Keep
              <br />
              moving
            </h2>

            <p className="mt-8 max-w-lg font-display text-[clamp(1.25rem,2.2vw,1.75rem)] leading-[1.05] tracking-[-0.025em] text-chrome/75">
              Everything worth driving, in one place.
            </p>

            <p className="mt-5 max-w-md text-sm leading-7 text-steel">
              Vehicles are supplied by dealers, owners, and mobility partners;
              Voltaris checks them.
            </p>

            <div className="mt-9">
              <SocialLinks className="flex flex-wrap gap-1" />
            </div>
          </div>

          <nav aria-label="Footer navigation" className="min-w-0 lg:pt-2">
            <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:gap-x-12">
              {footerColumns.map((column) => (
                <div key={column.heading} className="min-w-0">
                  <h2 className="eyebrow mb-5">{column.heading}</h2>

                  <ul className="space-y-1">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group flex min-h-11 items-center gap-2 py-1 font-display text-base font-medium tracking-tight text-steel transition-colors hover:text-chrome focus-visible:text-volt focus-visible:outline-none sm:text-lg"
                        >
                          <span>{link.label}</span>

                          <ArrowUpRight
                            className="h-3.5 w-3.5 shrink-0 -translate-x-1 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
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

        <div className="mt-20 border-t border-hairline pt-8 sm:mt-24 sm:pt-10 lg:mt-32">
          <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end lg:gap-16">
            <Link
              href="/"
              aria-label="Voltaris Mobility home"
              className="inline-flex w-fit rounded-sm text-chrome transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt"
            >
              <VoltarisLogo className="h-8 sm:h-9" />
            </Link>

            <p className="max-w-2xl font-display text-[clamp(1.15rem,2vw,1.55rem)] leading-[1.08] tracking-[-0.02em] text-chrome/65 lg:ml-auto lg:max-w-xl lg:text-right">
              Built for Rwanda. Designed around the way people actually
              discover, compare, buy, rent, and sell vehicles.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="shell flex flex-col gap-4 py-6 font-data text-[0.62rem] uppercase leading-relaxed tracking-[0.1em] text-steel-muted sm:py-7 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <p>
            © {new Date().getFullYear()} {site.legalName}. Kigali, Rwanda.
          </p>

          <p className="max-w-2xl lg:text-right">
            {credits.people.map((person, index) => (
              <span key={person.name}>
                {index > 0 && ' · '}
                {person.role} by{' '}
                {person.url ? (
                  <a
                    href={person.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-steel transition-colors hover:text-volt focus-visible:text-volt focus-visible:outline-none"
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
    </footer>
  );
}
