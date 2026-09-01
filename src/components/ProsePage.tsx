import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';

function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Shared layout for the legal and company pages: one column, generous measure — plus,
 * once a document has enough sections to need it, an in-page table of contents. Below
 * three sections a rail has nothing useful to organise; above that, a flat scroll of
 * every h2 in a row is exactly the "much content, but you only see what you're looking
 * for" problem this exists to solve.
 */
export function ProsePage({
  title,
  intro,
  path,
  updated,
  sections,
}: {
  title: string;
  intro: string;
  path: string;
  updated?: string;
  sections: { heading: string; body: string }[];
}) {
  const trail = [
    { name: 'Home', path: '/' },
    { name: title, path },
  ];

  const toc = sections.map((section) => ({ ...section, id: slugify(section.heading) }));
  const showToc = toc.length > 2;

  return (
    <div className="shell py-10">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <Breadcrumbs trail={trail} />

      <div className={showToc ? 'mt-8 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10' : ''}>
        {showToc && (
          <>
            {/* Mobile / tablet: a collapsed jump list rather than a permanent rail —
                there's no room for a sidebar, and a document this long benefits from
                staying out of the way until someone asks for it. */}
            <details className="group mb-8 border border-hairline lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 marker:hidden">
                <span className="font-data text-eyebrow uppercase text-chrome">On this page</span>
                <span
                  aria-hidden="true"
                  className="font-data text-xs text-steel-muted transition-transform duration-200 group-open:rotate-180"
                >
                  ▾
                </span>
              </summary>
              <nav aria-label={`Sections in ${title}`} className="border-t border-hairline/60 px-4 py-3">
                <ul className="space-y-2">
                  {toc.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`} className="text-sm text-steel hover:text-volt">
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>

            {/* Desktop / laptop: a sticky rail, same positioning convention as the
                account sidebar (lg:sticky lg:top-24) so "table of contents" looks
                like one component used twice rather than two different patterns. */}
            <nav
              aria-label={`Sections in ${title}`}
              className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
            >
              <p className="font-data text-eyebrow uppercase text-steel-muted">On this page</p>
              <ul className="mt-3 space-y-2.5 border-l border-hairline pl-4">
                {toc.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block text-sm text-steel transition-colors hover:text-chrome"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        )}

        <article className={showToc ? 'mx-auto max-w-2xl lg:mx-0' : 'mx-auto mt-8 max-w-2xl'}>
          <h1 className="font-display text-headline">{title}</h1>
          {updated && (
            <p className="mt-3 font-data text-xs text-steel-muted">
              Last updated{' '}
              <time dateTime={updated}>
                {new Date(updated).toLocaleDateString('en-RW', { dateStyle: 'long' })}
              </time>
            </p>
          )}
          <p className="mt-6 text-base leading-relaxed text-steel">{intro}</p>

          <div className="mt-12 space-y-10">
            {toc.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  {section.heading}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-steel">{section.body}</p>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
