import { describe, expect, it } from 'vitest';
import { splitDescription } from '../description';

describe('splitDescription', () => {
  it('keeps a short description whole', () => {
    expect(splitDescription('Barely run in. Full options list.')).toEqual({
      lead: 'Barely run in. Full options list.',
      rest: '',
    });
  });
  it('splits at the first paragraph break when one is near the top', () => {
    const r = splitDescription('First paragraph here.\n\nSecond paragraph, much longer, with the detail.');
    expect(r.lead).toBe('First paragraph here.');
    expect(r.rest).toBe('Second paragraph, much longer, with the detail.');
  });
  it('splits at a sentence boundary, never mid-sentence', () => {
    const s = Array.from({ length: 8 }, (_, i) => `Sentence number ${i + 1} says something useful about the car.`).join(' ');
    const r = splitDescription(s);
    expect(r.lead.endsWith('.')).toBe(true);
    expect(r.lead.length).toBeLessThanOrEqual(220 * 1.3);
    expect(r.lead + ' ' + r.rest).toBe(s);
  });
  it('handles empty input', () => {
    expect(splitDescription('   ')).toEqual({ lead: '', rest: '' });
  });
});
