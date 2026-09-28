import { describe, expect, it } from 'vitest';
import { bpsFromDeposit, computeLoan, depositFromBps } from '../amortisation';

describe('computeLoan', () => {
  it('matches the textbook annuity formula to the franc', () => {
    // 36,000,000 financed at 16.5% over 48 months.
    // Reference (float): 36e6 * 0.01375 / (1 - 1.01375^-48) = 1,029,492.36
    const r = computeLoan({ priceRwf: 45_000_000, depositRwf: 9_000_000, annualRateBps: 1650, termMonths: 48 });
    expect(r.financedRwf).toBe(36_000_000);
    expect(r.monthlyRwf).toBe(1_029_492);
    expect(r.totalRepayableRwf).toBe(1_029_492 * 48);
    expect(r.totalInterestRwf).toBe(1_029_492 * 48 - 36_000_000);
    expect(r.totalCostRwf).toBe(9_000_000 + 1_029_492 * 48);
  });

  it('returns whole francs only', () => {
    const r = computeLoan({ priceRwf: 12_345_678, depositRwf: 1_234_567, annualRateBps: 1975, termMonths: 37 });
    for (const v of [r.monthlyRwf, r.totalRepayableRwf, r.totalInterestRwf, r.totalCostRwf]) {
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('handles a zero rate as straight division, rounded up', () => {
    const r = computeLoan({ priceRwf: 10_000_001, depositRwf: 1, annualRateBps: 0, termMonths: 3 });
    expect(r.monthlyRwf).toBe(3_333_334);
    // Rounding up the instalment leaves 2 RWF over three months; never under-collects.
    expect(r.totalInterestRwf).toBe(2);
  });

  it('handles a deposit covering the whole price', () => {
    const r = computeLoan({ priceRwf: 5_000_000, depositRwf: 5_000_000, annualRateBps: 1650, termMonths: 24 });
    expect(r.monthlyRwf).toBe(0);
    expect(r.shareBps).toEqual({ deposit: 10_000, financed: 0, interest: 0 });
  });

  it('shares sum to 10,000 bps', () => {
    const r = computeLoan({ priceRwf: 60_000_000, depositRwf: 9_000_000, annualRateBps: 1750, termMonths: 60 });
    expect(r.shareBps.deposit + r.shareBps.financed + r.shareBps.interest).toBe(10_000);
  });

  it('rejects non-integer money', () => {
    expect(() => computeLoan({ priceRwf: 1.5, depositRwf: 0, annualRateBps: 1000, termMonths: 12 })).toThrow(RangeError);
    expect(() => computeLoan({ priceRwf: 100, depositRwf: 0, annualRateBps: 1000, termMonths: 0 })).toThrow(RangeError);
  });
});

describe('deposit helpers', () => {
  it('round-trips a percentage', () => {
    expect(depositFromBps(45_000_000, 2000)).toBe(9_000_000);
    expect(bpsFromDeposit(45_000_000, 9_000_000)).toBe(2000);
  });
  it('rounds RWF deposits to 10,000', () => {
    expect(depositFromBps(12_345_678, 2000)).toBe(2_470_000);
  });
});
