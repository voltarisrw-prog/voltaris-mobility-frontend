import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';

/** Shared layout for the legal and company pages: one column, generous measure. */
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

  return (
    <div className="shell py-10">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <Breadcrumbs trail={trail} />

      <article className="mx-auto mt-8 max-w-2xl">
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
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-xl font-semibold tracking-tight">
                {section.heading}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-steel">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
