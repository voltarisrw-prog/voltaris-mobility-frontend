/**
 * Splits a listing description into the sentence or two that sit under the
 * showroom strip and the remainder, which is revealed on request. Cuts at a
 * paragraph break first, then at a sentence boundary near the target length,
 * so the lead never ends mid-thought. Short descriptions are all lead.
 */
export function splitDescription(text: string, target = 220): { lead: string; rest: string } {
  const trimmed = text.trim();
  if (!trimmed) return { lead: '', rest: '' };

  const paragraphBreak = trimmed.indexOf('\n\n');
  if (paragraphBreak > 0 && paragraphBreak <= target * 1.5) {
    return { lead: trimmed.slice(0, paragraphBreak).trim(), rest: trimmed.slice(paragraphBreak).trim() };
  }
  if (trimmed.length <= target * 1.3) return { lead: trimmed, rest: '' };

  const window = trimmed.slice(0, target * 1.3);
  const cut = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '));
  if (cut < target * 0.4) return { lead: trimmed, rest: '' };
  return { lead: trimmed.slice(0, cut + 1).trim(), rest: trimmed.slice(cut + 1).trim() };
}
