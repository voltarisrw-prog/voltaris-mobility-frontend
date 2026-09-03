import type { Metadata, Viewport } from 'next';
import { Archivo, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { site } from '@/config/site';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { JsonLd } from '@/components/JsonLd';
import { organizationJsonLd } from '@/lib/seo/jsonld';
import { AnalyticsBootstrap } from '@/components/AnalyticsBootstrap';
import { ToastProvider } from '@/components/ui';

const display = Archivo({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
});
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const data = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-data',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description:
    'Compare, enquire about, and test drive electric vehicles from verified dealers and owners across Rwanda.',
  applicationName: site.name,
  formatDetection: { telephone: false },
  alternates: {
    types: { 'application/rss+xml': '/blog/rss.xml' },
  },
  icons: {
    icon: [{ url: '/brand/voltaris-app-icon.jpeg', type: 'image/jpeg' }],
    apple: [{ url: '/brand/voltaris-app-icon.jpeg' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#0C0906',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-RW" className={`${display.variable} ${body.variable} ${data.variable}`}>
      <body>
        <JsonLd data={organizationJsonLd()} />
        <AnalyticsBootstrap />
        <ToastProvider>
          <SiteHeader />
          <main id="main" className="pb-16 lg:pb-0">{children}</main>
          <SiteFooter />
        </ToastProvider>
      </body>
    </html>
  );
}
