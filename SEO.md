# SEO

## The metadata system

Pages never hand-write `<title>` or Open Graph tags. They call `buildMetadata()`
(`lib/seo/metadata.ts`) with a title, description, path, and optional image. Canonical
URL, robots directives, Open Graph, and Twitter cards are all derived from that one
input, so a change to the title format or card size is a one-file change.

## Indexation policy — the important part

Filter combinations multiply faster than search demand does. Left alone, `/cars` would
generate tens of thousands of near-identical pages and dilute the pages that matter.

`isIndexable()` in `lib/vehicles/filters.ts` allows:

- the bare marketplace
- exactly one of `make`, `body`, `location`, or `condition`, with a single value
- `make` + `location` together — a real query pattern ("BYD Kigali")

Everything else gets `noindex, follow`. Crawlers still walk those pages to discover
listings; the filtered view just never competes in the index. Deep pagination past
page 5 is also excluded.

This is unit-tested (`src/lib/vehicles/__tests__/filters.test.ts`) because it is the
kind of rule that quietly rots.

## Canonicals and duplicates

`canonicalPath()` drops `sort`, which reorders a result set without changing it —
otherwise seven sort options would each be a duplicate of the same page. Query keys
are sorted alphabetically in both the URL builder and the API client, so
`?make=byd&body=suv` and `?body=suv&make=byd` resolve to one canonical URL and one
cache key.

## Category landing pages ≠ filtered search

`/electric-suvs-rwanda` is a curated page with its own editorial content, not a
redirect to `/cars?body=suv`. Only curated pages appear in the sitemap. This is the
difference between a marketplace and a URL generator.

## Sold vehicles

A sold listing keeps its URL, stays crawlable, and keeps linking to live alternatives
— that page still helps someone who arrives from a search. It is marked `noindex` and
drops out of the sitemap. It is never 404'd, which would throw away accumulated links.

## Structured data

- `Organization` in the root layout, `@id`-referenced by article publishers
- `BreadcrumbList` on marketplace and detail pages
- `Car` (a `Product` subtype) carrying both specification and offer
- `FAQPage` only when the questions are actually rendered on the page
- Offer price is **omitted** when price is on request, rather than filled with a
  placeholder

## Titles and descriptions

The marketplace composes its title from the active filters, so each indexable facet
reads as its own page. Vehicle descriptions are generated from the specification —
range, battery, odometer, price, location — so two listings of the same model do not
produce identical meta descriptions.

## Homepage structured data

`WebSite` with a `SearchAction` pointing at `/cars?q={search_term_string}`, so the
site's own search can surface as a sitelinks search box. `Organization` sits in the
root layout and is `@id`-referenced by the article publisher field rather than being
repeated per page.

## Copy and factual claims

`src/content/home.ts` holds every static string on the homepage. Nothing in it
asserts inventory size, customer counts, or market position — no "thousands of cars",
no "Rwanda's largest". Counts that do appear are read from the API at request time,
so an empty marketplace renders an honest empty state instead of a claim.

Two briefed sections are intentionally not built: partner logos and testimonials.
Both need real inputs, and placeholder social proof on a trust-dependent marketplace
is worse than a shorter page. The reasoning is recorded at the foot of
`src/content/home.ts` along with where to add them.
