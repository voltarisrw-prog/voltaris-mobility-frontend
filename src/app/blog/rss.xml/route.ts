import { listPosts } from '@/lib/api/content';
import { site } from '@/config/site';
import { absoluteUrl } from '@/lib/seo/metadata';

export const revalidate = 900;

/** Escapes the five XML entities. A stray `&` in a title breaks the whole feed. */
function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(): Promise<Response> {
  let items = '';
  try {
    const posts = await listPosts();
    items = posts.items
      .map(
        (post) => `    <item>
      <title>${escape(post.title)}</title>
      <link>${absoluteUrl(`/blog/${post.slug}`)}</link>
      <guid isPermaLink="true">${absoluteUrl(`/blog/${post.slug}`)}</guid>
      <description>${escape(post.excerpt)}</description>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
    </item>`,
      )
      .join('\n');
  } catch {
    // An empty channel is still valid RSS. A 500 here would leave readers'
    // clients retrying and eventually dropping the subscription.
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(site.name)} — blog</title>
    <link>${absoluteUrl('/blog')}</link>
    <description>EV news and market updates from Rwanda.</description>
    <language>en-rw</language>
    <atom:link href="${absoluteUrl('/blog/rss.xml')}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900, stale-while-revalidate=3600',
    },
  });
}
