import { describe, expect, it } from 'vitest';
import { extractTableOfContents } from '../toc';

describe('extractTableOfContents', () => {
  it('extracts headings and strips inline markup from their text', () => {
    const html = '<p>Intro</p><h2>Battery <em>health</em> basics</h2><p>Body</p>';
    const { headings } = extractTableOfContents(html);
    expect(headings).toEqual([{ id: 'battery-health-basics', text: 'Battery health basics', level: 2 }]);
  });

  it('injects a matching id and scroll-mt-24 without disturbing inner markup', () => {
    const html = '<h2>Charging costs</h2>';
    const { html: result } = extractTableOfContents(html);
    expect(result).toBe('<h2 class="scroll-mt-24" id="charging-costs">Charging costs</h2>');
  });

  it('captures both h2 and h3, in document order, with correct levels', () => {
    const html = '<h2>Range</h2><p>...</p><h3>City driving</h3><h3>Highway driving</h3>';
    const { headings } = extractTableOfContents(html);
    expect(headings.map((h) => [h.level, h.text])).toEqual([
      [2, 'Range'],
      [3, 'City driving'],
      [3, 'Highway driving'],
    ]);
  });

  it('disambiguates duplicate headings instead of colliding on one id', () => {
    const html = '<h2>Overview</h2><h3>Overview</h3>';
    const { headings } = extractTableOfContents(html);
    expect(headings.map((h) => h.id)).toEqual(['overview', 'overview-2']);
  });

  it('preserves an existing class attribute rather than replacing it', () => {
    const html = '<h2 class="callout">Warranty</h2>';
    const { html: result } = extractTableOfContents(html);
    expect(result).toContain('class="callout scroll-mt-24"');
  });

  it('replaces a CMS-authored id rather than emitting two id attributes', () => {
    const html = '<h2 id="old-id">Ownership costs</h2>';
    const { html: result } = extractTableOfContents(html);
    expect(result).toBe('<h2 class="scroll-mt-24" id="ownership-costs">Ownership costs</h2>');
  });

  it('ignores a heading that is empty after stripping markup', () => {
    const html = '<h2><br /></h2><h2>Real heading</h2>';
    const { headings } = extractTableOfContents(html);
    expect(headings).toHaveLength(1);
    expect(headings[0]?.text).toBe('Real heading');
  });

  it('leaves non-heading content untouched', () => {
    const html = '<p>Nothing to extract here.</p>';
    const { headings, html: result } = extractTableOfContents(html);
    expect(headings).toHaveLength(0);
    expect(result).toBe(html);
  });
});
