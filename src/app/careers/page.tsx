import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { jobPostings } from '@/content/careers';
import { buildMetadata } from '@/lib/seo/metadata';
import { CareersRoles } from '@/features/careers/CareersRoles';
import { CareersMotion } from '@/features/careers/CareersMotion';
import '@/features/careers/careers.css';
import { archivo, instrument, manrope } from '@/features/home/landing/fonts';

const FONT_VARS = [archivo, instrument, manrope].map((f) => f.variable).join(' ');

export const metadata: Metadata = buildMetadata({
  title: 'Careers',
  description:
    'Join Voltaris Mobility and help build the future of vehicle commerce and electric mobility in Rwanda.',
  path: '/careers',
});

function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="cr-wg" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#7fd4ff" />
          <stop offset="1" stopColor="#12d6b0" />
        </linearGradient>
      </defs>
      <path d="M12 14l30 76h6L58 52" stroke="url(#cr-wg)" />
      <path d="M108 14L58 100" stroke="#f3f5fa" strokeOpacity=".7" />
    </svg>
  );
}

export default function CareersPage() {
  return (
    <div className={`cr-page ${FONT_VARS}`}>
      <CareersMotion />
      <div className="cr-w">
        <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Careers', path: '/careers' }]} />

        <header className="cr-hero">
          <div className="cr-im">
            <Image
              src="/demo/lifestyle/dealership-handshake.jpg"
              alt="Voltaris automotive partnership"
              fill
              priority
              sizes="100vw"
              className="cr-img"
            />
          </div>
          <Mark className="cr-wm" />
          <div className="cr-chip">
            <span>
              <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M3 5l10 22h2L19 12" fill="none" stroke="#7fd4ff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M29 5L19 27" fill="none" stroke="#f3f5fa" strokeWidth="3.2" strokeLinecap="round" />
              </svg>
            </span>
            <b>Careers at Voltaris</b>
          </div>
          <span className="cr-bd">
            <i />
            <span>
              <b data-cr-count={jobPostings.length}>{jobPostings.length}</b> open roles
            </span>
          </span>
          <h1 className="cr-h1" data-cr-split data-cr-in>
            <span className="cr-ln">Build the future</span>{' '}
            <span className="cr-ln">
              of <em>movement.</em>
            </span>
          </h1>
          <p className="cr-lead" data-cr-focus data-cr-in>
            We are building a better way to buy, sell, rent and understand vehicles in Rwanda. If you
            want to work on something real, come build it with us.
          </p>
        </header>

        <section className="cr-sec" aria-labelledby="cr-roles">
          <div className="cr-hd">
            <div>
              <p className="cr-eb" data-cr-in>
                Open positions
              </p>
              <h2 className="cr-sh" id="cr-roles" data-cr-split data-cr-in>
                Find your place <em>here.</em>
              </h2>
            </div>
            <ul className="cr-stm">
              <li data-cr-focus data-cr-in>Small team.</li>
              <li data-cr-focus data-cr-in>Real problems.</li>
              <li data-cr-focus data-cr-in>
                Work that changes how <em>Rwanda moves.</em>
              </li>
            </ul>
          </div>
          <CareersRoles jobs={jobPostings} />
        </section>

        <section className="cr-sec cr-cta" aria-labelledby="cr-next" data-cr-in>
          <Mark className="cr-wm" />
          <div>
            <p className="cr-eb" data-cr-in>
              Your next move
            </p>
            <h2 className="cr-ch" id="cr-next" data-cr-split data-cr-in>
              <span className="cr-ln">Don&rsquo;t see</span>{' '}
              <span className="cr-ln">
                your <em>role?</em>
              </span>
            </h2>
            <p className="cr-lead" data-cr-focus data-cr-in>
              We are always interested in exceptional people who want to help shape the future of
              mobility in Rwanda.
            </p>
          </div>
          <div className="cr-intro">
            <a
              href="mailto:hello@voltaris.rw?subject=General%20careers%20application"
              className="cr-big"
            >
              Introduce yourself
              <span>
                <ArrowRight size={26} strokeWidth={2.4} />
              </span>
            </a>
            <small>Send your CV and a short introduction</small>
          </div>
        </section>
      </div>
    </div>
  );
}
