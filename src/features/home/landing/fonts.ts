import { Archivo, Instrument_Serif, Manrope } from 'next/font/google';

/**
 * The home page's own three faces, loaded only where the home page is.
 *
 *   Archivo          — display. Variable on width as well as weight: headings
 *                      open out from narrow to wide as they scroll into view.
 *   Instrument Serif — the italic accent words ("Hybrid", "deserve", "Garage").
 *   Manrope          — body text, labels and buttons.
 */
export const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--home-display',
  display: 'swap',
});

export const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--home-serif',
  display: 'swap',
});

export const manrope = Manrope({
  subsets: ['latin'],
  variable: '--home-body',
  display: 'swap',
});

export const homeFonts = `${archivo.variable} ${instrument.variable} ${manrope.variable}`;
