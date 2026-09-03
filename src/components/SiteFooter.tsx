import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { VoltarisLogo } from './VoltarisLogo';
import { SocialLinks } from './SocialLinks';
import { site } from '@/config/site';

const footerGroups = [
  {
    heading: 'Explore',
    links: [
      { label: 'All vehicles', href: '/vehicles' },
      { label: 'Cars', href: '/vehicles/cars' },
      { label: 'Motorcycles', href: '/vehicles/motorcycles' },
      { label: 'Commercial', href: '/vehicles/commercial' },
      { label: 'Rental', href: '/rental' },
    ],
  },
  {
    heading: 'Buy',
    links: [
      { label: 'Browse vehicles', href: '/vehicles' },
      { label: 'Verified vehicles', href: '/vehicles?verified=true' },
      { label: 'How buying works', href: '/how-it-works' },
      { label: 'Financing', href: '/financing' },
      { label: 'FAQs', href: '/faq' },
    ],
  },
  {
    heading: 'Sell',
    links: [
      { label: 'Sell your vehicle', href: '/sell' },
      { label: 'Dealer solutions', href: '/dealers' },
      { label: 'Partner with Voltaris', href: '/partners' },
      { label: 'How selling works', href: '/how-it-works/sell' },
    ],
  },
  {
    heading: 'Voltaris',
    links: [
      { label: 'About us', href: '/about' },
      { label: 'Our standards', href: '/standards' },
      { label: 'Contact', href: '/contact' },
      { label: 'Help & support', href: '/help' },
      { label: 'Careers', href: '/careers' },
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
      className="group flex min-h-10 items-center justify-between border-b border-transparent py-1.5 font-display text-base font-medium tracking-[-0.02em] text-white/65 transition-all duration-300 hover:border-white/10 hover:text-white focus-visible:text-volt focus-visible:outline-none sm:text-lg"
    >
      <span>{label}</span>

      <ArrowUpRight
        aria-hidden="true"
        className="h-4 w-4 -translate-x-2 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
      />
    </Link>
  );
}

function FooterGroup({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="font-data text-[0.62rem] font-medium uppercase tracking-[0.2em] text-white/35">
        {heading}
      </h2>

      <ul className="mt-5 space-y-0.5">
        {links.map((link) => (
          <li key={link.href}>
            <FooterLink {...link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#070707] text-white">

      {/* =========================================================
          ATMOSPHERE
      ========================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-40 top-0 h-[38rem] w-[38rem] rounded-full bg-volt/[0.025] blur-3xl" />

        <div className="absolute -bottom-60 -left-40 h-[34rem] w-[34rem] rounded-full bg-white/[0.018] blur-3xl" />

        <div className="absolute right-[8%] top-[24%] hidden select-none font-display text-[32rem] font-medium uppercase leading-none tracking-[-0.12em] text-white/[0.012] lg:block">
          V
        </div>
      </div>

      {/* =========================================================
          HERO / BRAND STATEMENT
      ========================================================== */}

      <section className="relative border-b border-white/[0.09]">
        <div className="shell py-24 sm:py-32 lg:py-40 xl:py-48">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between lg:gap-20">

            <div className="min-w-0">

              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-volt" />

                <p className="font-data text-[0.62rem] uppercase tracking-[0.22em] text-white/40">
                  Voltaris Mobility
                </p>
              </div>

              <h2 className="mt-8 max-w-6xl font-display text-[clamp(4.4rem,12vw,12rem)] font-medium uppercase leading-[0.76] tracking-[-0.08em]">
                Move
                <br />
                <span className="text-white">with</span>{' '}
                <span className="text-volt">certainty.</span>
              </h2>

            </div>

            <div className="max-w-sm lg:mb-3">
              <p className="font-display text-[clamp(1.2rem,2vw,1.65rem)] leading-[1.08] tracking-[-0.025em] text-white/65">
                The smarter way to discover, compare, buy, rent, and sell
                vehicles in Rwanda.
              </p>

              <div className="mt-7 flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-volt" />

                <span className="font-data text-[0.58rem] uppercase tracking-[0.18em] text-white/30">
                  Built for the way Rwanda moves
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          DESKTOP NAVIGATION
      ========================================================== */}

      <section className="relative hidden border-b border-white/[0.09] lg:block">
        <div className="shell py-20 xl:py-24">

          <nav aria-label="Footer navigation">

            <div className="grid grid-cols-4 gap-10 xl:gap-16">
              {footerGroups.map((group) => (
                <FooterGroup
                  key={group.heading}
                  heading={group.heading}
                  links={group.links}
                />
              ))}
            </div>

          </nav>

        </div>
      </section>

      {/* =========================================================
          MOBILE NAVIGATION
      ========================================================== */}

      <section className="relative border-b border-white/[0.09] lg:hidden">
        <div className="shell py-8">

          <nav aria-label="Footer navigation">

            <div className="divide-y divide-white/[0.09]">

              {footerGroups.map((group) => (
                <details key={group.heading} className="group">

                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between py-4 font-data text-[0.68rem] uppercase tracking-[0.18em] text-white/60 marker:hidden">
                    <span>{group.heading}</span>

                    <span
                      aria-hidden="true"
                      className="relative flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-white/50 transition-all duration-300 group-open:rotate-45 group-open:border-volt group-open:text-volt"
                    >
                      <span className="absolute h-px w-2.5 bg-current" />
                      <span className="absolute h-2.5 w-px bg-current" />
                    </span>
                  </summary>

                  <ul className="pb-6 pl-0">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <FooterLink {...link} />
                      </li>
                    ))}
                  </ul>

                </details>
              ))}

            </div>

          </nav>

        </div>
      </section>

      {/* =========================================================
          BRAND / SOCIAL / LOCATION
      ========================================================== */}

      <section className="relative border-b border-white/[0.09]">
        <div className="shell py-12 sm:py-16 lg:py-20">

          <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">

            <div>

              <Link
                href="/"
                aria-label="Voltaris Mobility home"
                className="inline-flex rounded-sm text-white transition-opacity duration-300 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt"
              >
                <VoltarisLogo className="h-8 sm:h-9" />
              </Link>

              <p className="mt-6 max-w-md font-display text-lg leading-[1.1] tracking-[-0.02em] text-white/45">
                Built for Rwanda.
                <br />
                Designed around how people actually move.
              </p>

              <p className="mt-6 font-data text-[0.6rem] uppercase tracking-[0.16em] text-white/25">
                Kigali · Rwanda
              </p>

            </div>

            <div className="lg:text-right">

              <p className="font-data text-[0.6rem] uppercase tracking-[0.2em] text-white/30">
                Connect
              </p>

              <div className="mt-4 lg:flex lg:justify-end">
                <SocialLinks className="flex flex-wrap gap-1" />
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          CREDITS
      ========================================================== */}

      <section className="relative border-b border-white/[0.09]">
        <div className="shell py-7 sm:py-9">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-8">

            <p className="font-data text-[0.58rem] uppercase tracking-[0.15em] text-white/25">
              Crafted with precision.
            </p>

            <p className="font-data text-[0.58rem] uppercase leading-relaxed tracking-[0.1em] text-white/25 lg:text-right">
              Design &amp; Development by{' '}
              <span className="text-white/65">
                Patrice IRADUKUNDA
              </span>
            </p>

          </div>

        </div>
      </section>

      {/* =========================================================
          LEGAL BAR
      ========================================================== */}

      <div className="relative">
        <div className="shell flex flex-col gap-5 py-6 font-data text-[0.56rem] uppercase tracking-[0.12em] text-white/25 sm:py-7 lg:flex-row lg:items-center lg:justify-between lg:gap-8">

          <p>
            © {year} {site.legalName}. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-3">

            <Link
              href="/privacy"
              className="transition-colors hover:text-white focus-visible:text-volt focus-visible:outline-none"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition-colors hover:text-white focus-visible:text-volt focus-visible:outline-none"
            >
              Terms
            </Link>

            <Link
              href="/cookies"
              className="transition-colors hover:text-white focus-visible:text-volt focus-visible:outline-none"
            >
              Cookies
            </Link>

            <span className="text-white/20">
              Kigali, Rwanda
            </span>

          </div>

        </div>
      </div>

    </footer>
  );
}
