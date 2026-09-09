import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SellerListingFlow } from '@/features/sellers/SellerListingFlow';
import { SellWaitingList } from '@/features/sellers/SellWaitingList';
import { features } from '@/config/features';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Sell your electric or hybrid car in Rwanda',
  description:
    'Sell your electric or hybrid car through Voltaris. Create a considered listing, reach serious buyers, and get support through the selling process.',
  path: '/sell',
});

const benefits = [
  {
    icon: Sparkles,
    eyebrow: '01 / PRESENTATION',
    title: 'Make it look right.',
    body: 'Give your vehicle the space and detail it deserves with a cleaner, more considered listing experience.',
  },
  {
    icon: Users,
    eyebrow: '02 / AUDIENCE',
    title: 'Reach serious buyers.',
    body: 'Put your electric or hybrid vehicle in front of people actively looking for their next car.',
  },
  {
    icon: ShieldCheck,
    eyebrow: '03 / SUPPORT',
    title: 'Sell with confidence.',
    body: 'We review the information you provide and help buyers understand what makes your vehicle worth considering.',
  },
];

export default function SellPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-hairline bg-surface">
        <div className="shell">
          <div className="py-6">
            <Breadcrumbs
              trail={[
                { name: 'Home', path: '/' },
                { name: 'Sell your car', path: '/sell' },
              ]}
            />
          </div>

          <div className="grid min-h-[78svh] items-end gap-10 pb-16 pt-16 sm:pb-20 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16 lg:pb-24">
            <div>
              <p className="eyebrow">VOLTARIS / SELL</p>

              <h1 className="mt-5 max-w-5xl font-display text-[clamp(3.5rem,10vw,8.5rem)] font-semibold leading-[0.84] tracking-[-0.065em] text-chrome">
                Sell your car.
                <br />
                <span className="text-steel">The right way.</span>
              </h1>

              <p className="mt-8 max-w-xl text-base leading-relaxed text-steel sm:text-lg">
                Put your electric or hybrid vehicle in front of serious buyers with a cleaner,
                more considered selling experience.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href="#start-listing"
                  className="group inline-flex items-center gap-8 bg-volt px-6 py-4 font-data text-eyebrow uppercase text-surface transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <span>Start a listing</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </a>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-3 border border-chrome px-6 py-4 font-data text-eyebrow uppercase text-chrome transition-colors hover:bg-chrome hover:text-surface"
                >
                  <span>How it works</span>
                  <ArrowDown aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="border-l border-hairline pl-6 lg:mb-3">
              <p className="eyebrow">A BETTER WAY TO SELL</p>
              <p className="mt-5 font-display text-2xl font-medium leading-tight tracking-tight text-chrome sm:text-3xl">
                Your vehicle deserves more than a basic listing form.
              </p>
              <p className="mt-5 text-sm leading-relaxed text-steel">
                Tell us about the car, show us what makes it special, and let Voltaris handle the
                presentation.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-hairline">
          <div className="shell flex items-center justify-between py-4">
            <p className="font-data text-[10px] uppercase tracking-[0.18em] text-steel-muted">
              Electric + hybrid marketplace
            </p>
            <a
              href="#start-listing"
              className="font-data text-[10px] uppercase tracking-[0.18em] text-steel transition-colors hover:text-chrome"
            >
              Begin ↓
            </a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="shell py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="eyebrow">WHY VOLTARIS</p>
            <h2 className="mt-4 max-w-lg font-display text-section-heading tracking-tight text-chrome">
              A more considered way to move your car on.
            </h2>
          </div>

          <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
            {benefits.map(({ icon: Icon, eyebrow, title, body }) => (
              <article key={eyebrow} className="bg-surface p-6 sm:p-7">
                <Icon aria-hidden="true" className="h-5 w-5 text-volt" />
                <p className="mt-8 eyebrow text-steel-muted">{eyebrow}</p>
                <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-chrome">
                  {title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-steel">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="start-listing" className="border-y border-hairline bg-slab">
        <div className="shell py-20 sm:py-28">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow">LIST YOUR VEHICLE</p>
            <h2 className="mt-4 font-display text-section-heading tracking-tight text-chrome">
              Let&apos;s get it moving.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-steel sm:text-base">
              Add the details buyers need, upload your vehicle information, and submit your listing
              for review.
            </p>
          </div>

          {features.sellerListings ? <SellerListingFlow /> : <SellWaitingList />}
        </div>
      </section>

      <section className="shell py-20 sm:py-28">
        <div className="grid gap-10 border-t border-hairline pt-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="eyebrow">AFTER YOU SUBMIT</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="font-display text-xl font-semibold tracking-tight text-chrome">
                Review
              </p>
              <p className="mt-3 text-sm leading-relaxed text-steel">
                A Voltaris reviewer checks your vehicle details, photos, and supporting information.
              </p>
            </div>

            <div>
              <p className="font-display text-xl font-semibold tracking-tight text-chrome">
                Verification
              </p>
              <p className="mt-3 text-sm leading-relaxed text-steel">
                Where possible, we confirm important details such as ownership, import status, and
                battery information.
              </p>
            </div>

            <div>
              <p className="font-display text-xl font-semibold tracking-tight text-chrome">
                Go live
              </p>
              <p className="mt-3 text-sm leading-relaxed text-steel">
                Once approved, your vehicle can be presented to buyers across the Voltaris
                marketplace.
              </p>
            </div>

            <div>
              <p className="font-display text-xl font-semibold tracking-tight text-chrome">
                Meet the market
              </p>
              <p className="mt-3 text-sm leading-relaxed text-steel">
                Interested buyers can enquire and arrange the next step through Voltaris.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-hairline bg-chrome text-surface">
        <div className="shell py-20 sm:py-28">
          <p className="eyebrow text-surface/60">READY TO MOVE IT?</p>
          <div className="mt-5 flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <h2 className="max-w-3xl font-display text-[clamp(3rem,8vw,7rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
              Put your vehicle in the right hands.
            </h2>

            <Link
              href="#start-listing"
              className="group inline-flex shrink-0 items-center gap-8 border border-surface/40 px-6 py-4 font-data text-eyebrow uppercase transition-colors hover:bg-surface hover:text-chrome"
            >
              <span>Start a listing</span>
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
