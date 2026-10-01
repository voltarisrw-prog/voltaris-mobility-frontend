import { Inter } from 'next/font/google';

/** Display weights for car names and prices (the site's own Inter stays 400–600). */
export const heavy = Inter({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-inter-heavy',
  display: 'swap',
});
