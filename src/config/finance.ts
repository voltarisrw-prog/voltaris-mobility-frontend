/**
 * Vehicle-finance partners and their indicative terms.
 *
 * These are defaults for the calculator, not offers. Every figure is labelled
 * "indicative" on the page and the bank sets the real rate at approval. When
 * `GET /finance/rates` exists this file becomes its fallback.
 *
 * Rates are annual, in basis points, so the arithmetic stays in integers.
 */
export interface FinancePartner {
  id: string;
  name: string;
  shortName: string;
  /** Annual interest rate in basis points (1650 = 16.50 %). */
  annualRateBps: number;
  /** Minimum deposit the partner will accept, in basis points of price. */
  minDepositBps: number;
  minTermMonths: number;
  maxTermMonths: number;
  /** One line a buyer actually wants to know. */
  note: string;
}

export const financePartners: FinancePartner[] = [
  {
    id: 'bk',
    name: 'Bank of Kigali',
    shortName: 'BK',
    annualRateBps: 1650,
    minDepositBps: 2000,
    minTermMonths: 12,
    maxTermMonths: 72,
    note: 'Preferential EV rate; decision within five working days for salaried applicants.',
  },
  {
    id: 'im',
    name: 'I&M Bank Rwanda',
    shortName: 'I&M',
    annualRateBps: 1750,
    minDepositBps: 2500,
    minTermMonths: 12,
    maxTermMonths: 60,
    note: 'Suits business owners; accepts company financials in place of payslips.',
  },
  {
    id: 'unguka',
    name: 'Unguka Finance',
    shortName: 'Unguka',
    annualRateBps: 1950,
    minDepositBps: 1500,
    minTermMonths: 12,
    maxTermMonths: 48,
    note: 'Lowest deposit; built for taxi and fleet operators buying to earn.',
  },
];

export const financeDefaults = {
  depositBps: 2000,
  termMonths: 48,
  minTermMonths: 12,
  maxTermMonths: 72,
  /** Sensible price when the page is opened without a vehicle. */
  fallbackPriceRwf: 45_000_000,
} as const;
