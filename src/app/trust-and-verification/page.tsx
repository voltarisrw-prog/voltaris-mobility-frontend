import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Check, FileCheck2, Landmark, BatteryCharging, Mail, ScanSearch, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { company, trust } from '@/content/legal';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { homeFonts } from '@/features/home/landing/fonts';
import { TrustCopy } from '@/features/trust/TrustCopy';
import { TrustDemo } from '@/features/trust/TrustDemo';
import { TrustMotion } from '@/features/trust/TrustMotion';
import '@/features/trust/trust.css';

export const metadata: Metadata = buildMetadata({
  title: 'Trust and verification',
  description:
    'What the Voltaris verified mark means: ownership documents matched, import and duty status confirmed, battery health read from the vehicle, and a physical inspection.',
  path: '/trust-and-verification',
});

const ICONS: LucideIcon[] = [FileCheck2, Landmark, BatteryCharging, ScanSearch];
const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];

export default function TrustPage() {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Trust and verification', path: '/trust-and-verification' },
  ];
  const words = trust.title.split(' ');
  const accent = words.pop() ?? '';
  const count = trust.checks.length;

  return (
    <div className={`tr-page ${homeFonts}`}>
      <TrustMotion />
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <div className="tr-w">
        <Breadcrumbs trail={trail} />

        <section className="tr-hero">
          <div>
            <p className="tr-eb">Trust / Verification</p>
            <h1 className="tr-h1" data-tr-split data-tr-wide data-tr-in>
              <span className="tr-ln">{words.join(' ')}</span>{' '}
              <span className="tr-ln">
                <em>{accent}</em>
              </span>
            </h1>
            <p className="tr-lead" data-tr-focus data-tr-in>
              {trust.intro}
            </p>
            <div className="tr-ctas">
              <Link href="/cars?verified=true" className="tr-btn">
                Browse verified vehicles <ArrowRight size={18} />
              </Link>
              <Link href="/how-it-works" className="tr-btn tr-gh">
                How it works <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <TrustDemo checks={trust.checks.map((c) => ({ title: c.title }))} />
        </section>

        <section className="tr-sec" aria-labelledby="tr-checks">
          <p className="tr-eb">The checks</p>
          <h2 className="tr-h2" id="tr-checks" data-tr-split data-tr-wide data-tr-in>
            {NUMBER_WORDS[count] ?? count} <em>checks.</em>
          </h2>

          <ol className="tr-vgrid">
            {trust.checks.map((check, index) => {
              const Icon = ICONS[index] ?? ShieldCheck;
              return (
                <li key={check.title} className="tr-vc">
                  <span className="tr-vn" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="tr-vi">
                    <Icon size={28} strokeWidth={1.8} />
                  </span>
                  <small>Verification {String(index + 1).padStart(2, '0')}</small>
                  <h3>{check.title}</h3>
                  <p>{check.body}</p>
                </li>
              );
            })}
          </ol>

          <div className="tr-pair">
            <section className="tr-pc tr-m">
              <span className="tr-bd">
                <Check size={30} strokeWidth={2.4} />
              </span>
              <small>Verified mark</small>
              <h3>{trust.badge.title}</h3>
              <p>{trust.badge.body}</p>
            </section>
            {/* Stating the limits is what makes the claims above credible. */}
            <section className="tr-pc tr-l">
              <span className="tr-bd">
                <AlertCircle size={30} strokeWidth={2.2} />
              </span>
              <small>Important limits</small>
              <h3>{trust.limits.title}</h3>
              <p>{trust.limits.body}</p>
            </section>
          </div>

          <section className="tr-rp">
            <span className="tr-ri">
              <Mail size={30} strokeWidth={1.8} />
            </span>
            <div>
              <small>Report an issue</small>
              <h3>{trust.reporting.title}</h3>
              <p>{trust.reporting.body}</p>
            </div>
            <div className="tr-mail">
              <a className="tr-btn" href={`mailto:${company.email}?subject=Listing%20report`}>
                Write to us <ArrowRight size={18} />
              </a>
              <TrustCopy text={company.email} />
            </div>
          </section>

          <div className="tr-end">
            <Link href="/cars?verified=true" className="tr-btn">
              Browse verified vehicles <ArrowRight size={18} />
            </Link>
            <Link href="/how-it-works" className="tr-btn tr-gh">
              How it works <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
