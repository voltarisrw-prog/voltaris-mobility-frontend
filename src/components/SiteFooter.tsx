import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { VoltarisLogo } from './VoltarisLogo';
import { SocialLinks } from './SocialLinks';
import { site } from '@/config/site';

const footerGroups = [
  {
    heading: 'Discover',
    links: [
      { label: 'Cars', href: '/cars' },
      { label: 'Brands', href: '/brands' },
      { label: 'Dealers', href: '/dealers' },
      { label: 'Compare', href: '/compare' },
      { label: 'Charging', href: '/charging' },
      { label: 'Test drive', href: '/test-drive' },
    ],
  },
  {
    heading: 'Buy & Sell',
    links: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Sell a vehicle', href: '/sell' },
      { label: 'Trust & verification', href: '/trust-and-verification' },
      { label: 'Guides', href: '/guides' },
      { label: 'Help', href: '/help' },
    ],
  },
  {
    heading: 'Explore',
    links: [
      { label: 'Electric cars in Kigali', href: '/electric-cars-kigali' },
      { label: 'Electric cars in Rwanda', href: '/electric-cars-rwanda' },
      { label: 'Electric SUVs', href: '/electric-suvs-rwanda' },
      { label: 'Electric sedans', href: '/electric-sedans-rwanda' },
      { label: 'Used electric cars', href: '/used-electric-cars-rwanda' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    heading: 'Voltaris',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy', href: '/legal/privacy' },
      { label: 'Terms', href: '/legal/terms' },
    ],
  },
];

function FooterLink({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-9 items-center gap-2 py-1 font-display text-[0.95rem] font-medium tracking-[-0.02em] text-black/55 transition-colors duration-200 hover:text-[#0a0a0a] focus-visible:text-[color:var(--vds-brand-secondary)] focus-visible:outline-none sm:text-base"
    >
      <span>{label}</span>

      <ArrowUpRight
        aria-hidden="true"
        className="h-3.5 w-3.5 -translate-x-1 translate-y-0.5 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
      />
    </Link>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-[color:var(--vds-border)] vds-site-footer text-[#0a0a0a]">

      {/* =========================================================
          COMPACT FOOTER
      ========================================================== */}

      <div className="shell py-7 sm:py-12 lg:py-16">

        <div className="grid gap-7 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,2fr)] lg:gap-20 xl:gap-28">

          {/* =====================================================
              BRAND
          ====================================================== */}

          <div className="relative min-w-0">

            <Link
              href="/"
              aria-label="Voltaris Mobility home"
              className="inline-flex rounded-sm text-[#0a0a0a] transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt"
            >
              <VoltarisLogo className="h-8 sm:h-9" />
            </Link>

            <p className="mt-3 max-w-xs text-sm leading-5 text-[#6b6b6b]">
              Mobility, made simpler.
            </p>

            <div className="mt-4">
              <SocialLinks className="flex flex-wrap gap-1" />
            </div>

            <div className="mt-4">
              <span className="font-data text-[0.56rem] uppercase tracking-[0.16em] text-[#6b6b6b]">
                Kigali · Rwanda
              </span>
            </div>

          </div>

          {/* =====================================================
              NAVIGATION
          ====================================================== */}

          <nav aria-label="Footer navigation">

              {/* MOBILE — COMPACT EXPANDABLE NAVIGATION */}
              <div className="sm:hidden divide-y divide-[color:var(--vds-border)] border-y border-[color:var(--vds-border)]">

                {footerGroups.map((group) => (
                  <details key={group.heading} className="group">

                    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between py-3">
                      <span className="font-data text-[0.58rem] font-medium uppercase tracking-[0.18em] text-[#6b6b6b]">
                        {group.heading}
                      </span>

                      <span
                        aria-hidden="true"
                        className="relative flex h-7 w-7 shrink-0 items-center justify-center text-[#6b6b6b]"
                      >
                        <span className="absolute h-px w-3 bg-current" />
                        <span className="absolute h-3 w-px bg-current transition-transform duration-200 group-open:rotate-90" />
                      </span>
                    </summary>

                    <ul className="pb-3 pl-0">
                      {group.links.map((link) => (
                        <li key={link.href}>
                          <FooterLink {...link} />
                        </li>
                      ))}
                    </ul>

                  </details>
                ))}

              </div>

              {/* DESKTOP / TABLET — FULL NAVIGATION */}
              <div className="hidden sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-10 xl:gap-x-14">

                {footerGroups.map((group) => (
                  <div key={group.heading} className="min-w-0">

                    <h2 className="font-data text-[0.58rem] font-medium uppercase tracking-[0.18em] text-[#6b6b6b]">
                      {group.heading}
                    </h2>

                    <ul className="mt-4 space-y-0.5">
                      {group.links.map((link) => (
                        <li key={link.href}>
                          <FooterLink {...link} />
                        </li>
                      ))}
                    </ul>

                  </div>
                ))}

              </div>

            </nav>

        </div>

        {/* =======================================================
            ACCREDITATION + LEGAL
        ======================================================== */}

        <div className="mt-7 border-t border-[color:var(--vds-border)] pt-4 sm:mt-14 sm:pt-6">

          <div className="flex flex-col gap-3 text-[0.52rem] uppercase tracking-[0.1em] text-[#6b6b6b] lg:flex-row lg:items-center lg:justify-between lg:gap-8">

            <p>
              © {year} {site.legalName}. All rights reserved.
            </p>

            <p>
              Designed &amp; Developed by{' '}
              <span className="text-[#4a4a4a]">
                <a href="https://www.linkedin.com/in/patrice-iradukunda-74931827a/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:opacity-70">Patrice IRADUKUNDA</a>
              </span>
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2">

              <Link
                href="/legal/privacy"
                className="transition-colors hover:text-[#0a0a0a] focus-visible:text-[color:var(--vds-brand-secondary)] focus-visible:outline-none"
              >
                Privacy
              </Link>

              <Link
                href="/legal/terms"
                className="transition-colors hover:text-[#0a0a0a] focus-visible:text-[color:var(--vds-brand-secondary)] focus-visible:outline-none"
              >
                Terms
              </Link>

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
}
