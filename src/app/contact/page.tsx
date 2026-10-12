import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { company } from '@/content/legal';
import { buildMetadata } from '@/lib/seo/metadata';
import { homeFonts } from '@/features/home/landing/fonts';
import { ContactCards } from '@/features/contact/ContactCards';
import { ContactForm } from '@/features/contact/ContactForm';
import { ContactMotion } from '@/features/contact/ContactMotion';
import '@/features/contact/contact.css';

export const metadata: Metadata = buildMetadata({
  title: 'Contact Voltaris',
  description: 'Talk to the Voltaris team in Kigali about buying, selling, or partnering.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className={`ct-page ${homeFonts}`}>
      <ContactMotion />
      <div className="ct-w">
        <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]} />

        <div className="ct-hd">
          <h1 className="ct-h1" data-ct-split data-ct-in>
            Talk to <em>us</em>
          </h1>
          <p className="ct-lead" data-ct-focus data-ct-in>
            A person reads every message and replies within a working day. You do not need to have
            picked a vehicle first — most people who write to us have not.
          </p>
        </div>

        <div className="ct-grid">
          <ContactCards
            email={company.email}
            phone={company.phone}
            address={company.address}
            privacyEmail={company.privacyEmail}
          />
          <section className="ct-card" aria-label="Send a message">
            <ContactForm />
          </section>
        </div>
      </div>
    </div>
  );
}
