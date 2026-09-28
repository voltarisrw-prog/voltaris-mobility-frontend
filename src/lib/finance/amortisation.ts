/**
 * Fixed-rate, equal-instalment (annuity) loan arithmetic in whole RWF.
 *
 * Same discipline as the backend commission calculator: no floating-point
 * money. Rates come in as basis points, months as integers, and every output
 * is a whole-franc integer. The one unavoidable fraction — the compounding
 * factor — is computed with BigInt scaled by 1e12 and rounded once.
 */

const SCALE = 1_000_000_000_000n; // 1e12 fixed-point

export interface LoanInput {
  priceRwf: number;
  depositRwf: number;
  annualRateBps: number;
  termMonths: number;
}

export interface LoanResult {
  priceRwf: number;
  depositRwf: number;
  financedRwf: number;
  monthlyRwf: number;
  totalRepayableRwf: number;
  totalInterestRwf: number;
  totalCostRwf: number;
  /** Share of total cost, in basis points, for the deposit/financed/interest bar. */
  shareBps: { deposit: number; financed: number; interest: number };
}

function assertInt(name: string, value: number) {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer, got ${value}`);
  }
}

/** (1 + r)^n in fixed point, where r = monthly rate as a fraction of SCALE. */
function powFixed(base: bigint, exp: number): bigint {
  let result = SCALE;
  let b = base;
  let e = exp;
  while (e > 0) {
    if (e & 1) result = (result * b) / SCALE;
    b = (b * b) / SCALE;
    e >>= 1;
  }
  return result;
}

function divRound(a: bigint, b: bigint): bigint {
  return (a + b / 2n) / b;
}

export function computeLoan(input: LoanInput): LoanResult {
  const { priceRwf, depositRwf, annualRateBps, termMonths } = input;
  assertInt('priceRwf', priceRwf);
  assertInt('depositRwf', depositRwf);
  assertInt('annualRateBps', annualRateBps);
  assertInt('termMonths', termMonths);
  if (termMonths === 0) throw new RangeError('termMonths must be at least 1');

  const financedRwf = Math.max(0, priceRwf - depositRwf);

  let monthlyRwf: number;
  if (financedRwf === 0) {
    monthlyRwf = 0;
  } else if (annualRateBps === 0) {
    monthlyRwf = Math.ceil(financedRwf / termMonths);
  } else {
    // monthly rate r = bps / 10_000 / 12, in SCALE units
    const r = divRound(BigInt(annualRateBps) * SCALE, 10_000n * 12n);
    const onePlusRn = powFixed(SCALE + r, termMonths); // (1+r)^n
    // payment = P * r * (1+r)^n / ((1+r)^n - 1)
    const numerator = BigInt(financedRwf) * r * onePlusRn;
    const denominator = (onePlusRn - SCALE) * SCALE;
    monthlyRwf = Number(divRound(numerator, denominator));
  }

  const totalRepayableRwf = monthlyRwf * termMonths;
  const totalInterestRwf = Math.max(0, totalRepayableRwf - financedRwf);
  const totalCostRwf = depositRwf + totalRepayableRwf;

  const share = (part: number) =>
    totalCostRwf === 0 ? 0 : Math.round((part * 10_000) / totalCostRwf);
  const deposit = share(depositRwf);
  const interest = share(totalInterestRwf);

  return {
    priceRwf,
    depositRwf,
    financedRwf,
    monthlyRwf,
    totalRepayableRwf,
    totalInterestRwf,
    totalCostRwf,
    shareBps: { deposit, financed: Math.max(0, 10_000 - deposit - interest), interest },
  };
}

/** Deposit in RWF from a share of the price in basis points, rounded to the nearest 10,000 RWF. */
export function depositFromBps(priceRwf: number, bps: number): number {
  return Math.round((priceRwf * bps) / 10_000 / 10_000) * 10_000;
}

/** Share of price in basis points for a deposit in RWF (for the % ↔ RWF toggle). */
export function bpsFromDeposit(priceRwf: number, depositRwf: number): number {
  if (priceRwf === 0) return 0;
  return Math.round((depositRwf * 10_000) / priceRwf);
}
