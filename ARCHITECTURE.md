# Architecture

## Layering

```
app/          routes, metadata, data fetching (Server Components by default)
components/   presentational; Client Components only where interaction requires
lib/api/      the only place fetch() is called
lib/seo/      metadata builders and structured data
lib/analytics/ typed event contract + provider registry
lib/vehicles/ filter parsing, URL serialisation, indexation policy
types/        backend contracts
config/       site constants
```

One rule holds the shape together: **components never fetch, and `lib/api` never
renders.** A component receives data or receives an error state.

## State

| Kind of state                          | Where it lives                              |
| -------------------------------------- | ------------------------------------------- |
| Server data                            | Server Components + the Next data cache     |
| Marketplace filters                    | The URL                                     |
| Transient UI (panel open, input draft) | `useState` in the nearest client component  |
| Global client state                    | None yet, and none until something needs it |

Filters live in the URL because a result set that cannot be shared, bookmarked, or
crawled is worth much less than one that can. `VehicleFilters` only computes a new
URL; the server re-renders the results.

## Caching and revalidation

`request()` takes `revalidate` and `tags`. Calls that omit both are `no-store`,
which is the correct default for anything user-specific or mutating. Payment state
is explicitly never cached — a stale `PENDING` and a stale `PAID` are both damaging.

Tags are exported from `lib/api/vehicles.ts` (`VEHICLE_LIST_TAG`, `vehicleTag`) so a
backend webhook can purge a single listing on update.

## Backend dependencies

None of these exist yet. Each is typed and documented at its call site.

| Route                                                            | Used by                     |
| ---------------------------------------------------------------- | --------------------------- |
| `GET /vehicles`                                                  | marketplace, homepage       |
| `GET /vehicles/facets`                                           | filter panel                |
| `GET /vehicles/by-slug/{slug}`                                   | detail page                 |
| `GET /vehicles/{id}/similar`                                     | detail page                 |
| `GET /vehicles/sitemap`                                          | `sitemap.xml`               |
| `POST /vehicles/compare`                                         | comparison — now has an on-ramp from cards and detail pages |
| `GET /dealers`, `/dealers/{slug}`, `/dealers/{slug}/vehicles`    | dealer pages (UI not built) |
| `POST /inquiries`                                                | enquiry form (UI not built) |
| `POST /test-drives`, `GET /test-drives/{ref}`                    | test drive (UI not built)   |
| `POST /orders/{id}/checkout-session`, `GET /orders/{id}/payment` | checkout (UI not built)     |
| `GET /vehicles?rentalLocation=&rentalStart=&rentalEnd=`          | rental-aware marketplace and detail (lib/api/vehicles.ts) |
| `GET /rentals/locations`                                         | rental location picker (lib/api/rentals.ts) |
| `GET /vehicles/{id}/rental-quote`                                | rental price preview before checkout (lib/api/rentals.ts) |

### Two contracts the backend must honour

1. **The vehicle slug is backend-owned.** The frontend never constructs
   `{make}-{model}-{year}-{location}` — it reads `vehicle.slug` and looks up by it.
   The brief's URL shape has no unique component, so the backend must guarantee
   uniqueness (a disambiguating suffix on collision). Building slugs client-side
   would produce two listings fighting over one URL.
2. **The backend decides what a viewer may see.** `VehicleSeller.phone` and
   `whatsapp` are optional in the type because the API omits them when disclosure is
   not permitted. The frontend renders what it is given and never gates on a role it
   computed itself.

## Security posture

- Sessions are httpOnly cookies set by the backend. No token ever touches JS storage;
  ESLint blocks `localStorage` outright.
- Mutations send `X-CSRF-Token` read from a readable double-submit cookie.
- Backend error `message` is treated as untrusted for display. `displayMessage()`
  maps known codes and falls back to generic copy, so internal detail cannot leak.
- Structured data escapes `<` before serialising, so backend content cannot break out
  of the `<script>` tag.
- `/admin` and `/account` carry `X-Robots-Tag: noindex` at the header level, not just
  in robots.txt.
- Payment state is read from the backend, never inferred from a redirect.
- Analytics strips forbidden property keys at runtime as well as at compile time.

## Performance

- Server Components by default. The only client JS on the marketplace is the filter
  panel; the detail page ships a single small effect for the `vehicle_view` event.
- Images consume pre-derived size variants (`thumb`/`card`/`detail`/`gallery`) from
  object storage. The original is never referenced.
- Only the first row of cards is `priority`; everything below lazy-loads.
- Fonts use `next/font` with `display: swap`, self-hosted at build time.

Measured Phase 1 build: homepage 111 kB first load, marketplace 126 kB.

## Route map

```
/                               homepage
/cars                           marketplace, filters in the URL
/cars/{slug}                    vehicle detail
/cars/{slug}/enquire            enquiry form
/compare?ids=…                  comparison, shareable
/rent                           rental landing — location + date range, then hands
                                off into /cars with rentalLocation/rentalStart/
                                rentalEnd rather than a parallel listings page
/sell                           seller listing flow
/test-drive                     test drive request
/test-drive/{reference}         public status tracking
/dealers, /dealers/{slug}       dealer directory and profiles
/brands, /brands/{brand}        brand directory and profiles
/guides, /guides/{slug}         editorial
/charging                       charging directory
/electric-cars-rwanda           curated landing pages (5)
/electric-suvs-rwanda
/electric-sedans-rwanda
/used-electric-cars-rwanda
/electric-cars-kigali
/login /register                auth
/forgot-password /reset-password /verify-email
/account/*                      profile, saved, searches, inquiries,
                                test-drives, orders, rentals, notifications
/checkout/start                 creates the order server-side, then redirects
/checkout/{orderId}             payment state read from the backend
/admin/*                        dashboard, vehicles, leads, audit
```

## Two verification results worth recording

**Server-side auth needed explicit cookie forwarding.** `credentials: 'include'` does
nothing during server rendering — there is no browser to attach cookies — so every
authenticated Server Component call returned 401. The fix is the `auth: true` flag on
`request()`, which forwards the incoming cookie header via `next/headers`. It is
per-call rather than default because reading cookies opts a route out of static
rendering: correct for `/account`, wrong for `/cars`. This surfaced only when the
build tried to prerender `/account/inquiries`; static analysis would not have found it.

**Three mirror-state effects were cascading renders.** The search input, the numeric
filter fields, and the comparison loader each copied a derived value into state inside
an effect. Replaced with `useMemo` for the object URLs, adjustment-during-render for
the two draft inputs, and a key-stamped result for the comparison, so loading and
error are derived rather than reset in an effect body.

## Verified at runtime

Against a production build served locally: `robots.txt` disallows `/admin`, `/account`,
`/api/`, `/checkout`, and sort/page parameters; `X-Robots-Tag: noindex, nofollow` is
present on `/admin` and `/account` responses; the proxy redirects both to `/login` with
an escaped relative `next`; `nosniff`, `DENY`, `strict-origin-when-cross-origin`, and
HSTS are set on every response; `/cars?minRange=300` emits `noindex, follow` while
`/cars?make=byd` emits `index, follow`; the sitemap contains no admin or account URLs;
the skip link is present and the homepage has exactly one `h1`.


## Brand system

Colours are sampled from the supplied logo artwork rather than chosen: the near-black
field (`#00030C`), the chrome of the V (`#E8EAED` through `#6C727C`), and the electric
blue of the road light (`#5CC8FF`). There is no second accent, because the mark does
not have one.

The structural motif is the mark's vanishing point — perspective lines converging on a
light source. It is used exactly three ways, and nowhere else:

1. **The hero backdrop** (`features/home/HeroBackdrop.tsx`) — lane lines converging on
   a horizon glow. Pure SVG and CSS: no video, no image payload, nothing blocking LCP.
2. **Section dividers** (`.lane-rule`) — a hairline that brightens toward the centre,
   like a road seam.
3. **The range meter** (`.range-fill`) — the lane marking itself, a chrome-to-blue
   gradient with a soft glow.

`components/VoltarisLogo.tsx` rebuilds the mark as vector. The supplied JPEGs have a
baked-in dark field, so they cannot sit on a transparent header, cannot be recoloured,
and go soft at both 24px and 400px. The raster files stay in `public/brand/` for Open
Graph cards and app icons, which is what a bitmap is actually for.

### Contrast

The accent is a light blue at roughly 8:1 against the surface, so it carries body text
and hairlines. White type on that blue is about 1.9:1, so every filled accent element
uses `text-surface` instead — enforced in `components/ui`, not left to each call site.


## The environment layer

`features/environment/VoltarisEnvironment.tsx` is a single fixed layer mounted once in
the root layout at `z-index: -1`. Every route sits inside the same room, which is what
makes the site read as one space rather than a stack of separately-decorated sections.

Five planes, far to near:

| Plane | What it is |
| --- | --- |
| Atmosphere | The volume of the room — gradients, a horizon band, floor haze |
| Architecture | A vast hall: curved ceiling ribs, flanking columns, floor seams |
| Horizon | Distant skyline silhouettes behind the far glazing |
| Automotive | Three light trails and a headlight bloom at the vanishing point |
| Lighting | Volumetric cones from the ceiling ribs, plus film grain |

### Why it is cheap

No images, no video, no canvas, no WebGL. Everything is CSS gradients and one inline
SVG, so the environment adds nothing to the network waterfall and cannot block LCP.
The grain is an inline `feTurbulence` data URI — a few hundred bytes, and it exists
because wide dark gradients band badly on 6-bit laptop panels; the noise dissolves the
steps and reads as film rather than as compression.

The only JavaScript is a rAF-gated scroll listener writing one custom property,
`--journey` (0 at the top of the document, 1 at the bottom). Every plane offsets
against it at a different rate — far moves least, near moves most, which is the whole
parallax illusion. Only `transform` and `opacity` animate, so the work stays on the
compositor: no layout, no paint.

### Degradation

- **Mobile** (`< 768px`) drops the architecture SVG entirely. Its detail would be
  sub-pixel at that width and the paint cost buys nothing; atmosphere, lighting, and
  grain remain, so the depth and the mood survive.
- **Reduced motion** keeps the entire environment and removes every movement,
  including the scroll listener, which never attaches. The atmosphere is the point;
  the drift is garnish.

### Content protection

`body` is transparent so the layer beneath shows through, while `html` keeps the solid
`#00030C` — there is never a flash of white before paint.

Panels that were opaque now use three utilities instead of raw colours: `.panel`
(75% + blur) for tiles and cards, `.panel-deep` (60% + blur) for full-width dark
bands, and `.panel-field` (85% + blur) for form inputs, which have to keep reading as
fields. Chrome type over the darkest possible composite still measures above 12:1, so
depth reads through the page without ever costing legibility.

Nothing about navigation, search, cards, forms, routes, or API integration changed —
only what those elements sit on.


## The backdrop

The showroom plate is the backdrop of the entire site: one fixed layer at
`z-index: -1` in the root layout, rendered from a single file in two treatments.

`VoltarisEnvironment` holds it heavily dimmed — desaturated to 22%, cooled toward
the brand blue, sunk under a radial dark wash. `HeroMedia` renders the same URL at
near-full clarity with a left-weighted scrim. The browser fetches it once.

The dimming is a legibility requirement, not a taste call. The plate is bright,
high-contrast, cool-white, and this layer sits under every paragraph, price, and
form label on the site. Undimmed, chrome text over the white bodywork or the lit
ceiling strips falls below 4.5:1. Graded, the composite holds above 12:1
everywhere, and the hero is where the image gets to be seen properly.

Three grading passes rather than one, because a single black overlay flattens the
photograph to grey mud; separating desaturate / colour-blend / darken keeps the
speculars on the bodywork alive.

Assets are AVIF and WebP at 640/1024/1536 — 70 KB AVIF at full width, from a 2 MB
PNG source. The optional orbit video and its activation are documented in
`HERO_VIDEO.md`.
