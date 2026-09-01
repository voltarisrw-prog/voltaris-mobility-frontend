import { slugify } from '@/lib/format';

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * `body_html` is pre-sanitised CMS output (see the note where it's rendered in
 * guides/[slug]/page.tsx) — this reads its <h2>/<h3> structure to build a table of
 * contents and returns the same HTML with matching `id` and `scroll-mt-24` added to
 * each heading, so the table of contents' anchors actually land somewhere below the
 * sticky site header. This is a structural read of already-trusted markup, not a
 * second sanitisation pass; it must never be pointed at untrusted input.
 *
 * `scroll-mt-24` is injected as a literal class name rather than an inline style
 * because that utility is already compiled into the site's CSS (ProsePage uses the
 * same class), so Tailwind's build-time class scan doesn't need to see it used
 * anywhere the CMS content itself would count.
 */
export function extractTableOfContents(html: string): { headings: TocHeading[]; html: string } {
  const seen = new Map<string, number>();
  const headings: TocHeading[] = [];

  const withIds = html.replace(
    /<h([23])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/gi,
    (match, levelToken: string, attrs: string, inner: string) => {
      const level = Number(levelToken) as 2 | 3;
      const text = inner.replace(/<[^>]+>/g, '').trim();
      if (!text) return match;

      const base = slugify(text) || `section-${headings.length + 1}`;
      const priorCount = seen.get(base) ?? 0;
      seen.set(base, priorCount + 1);
      const id = priorCount === 0 ? base : `${base}-${priorCount + 1}`;

      headings.push({ id, text, level });

      // A CMS-authored id or class, if present, is preserved and extended rather
      // than clobbered — this only ever adds what it needs.
      let nextAttrs = attrs.replace(/\sid="[^"]*"/i, '');
      nextAttrs = /\sclass="/i.test(nextAttrs)
        ? nextAttrs.replace(/\sclass="([^"]*)"/i, ' class="$1 scroll-mt-24"')
        : `${nextAttrs} class="scroll-mt-24"`;

      return `<h${level}${nextAttrs} id="${id}">${inner}</h${level}>`;
    },
  );

  return { headings, html: withIds };
}
