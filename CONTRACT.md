# Frontend ↔ backend contract

The frontend calls 28 endpoints. The backend implements 21. This file is the honest
state of the seam between them, kept current so nobody discovers a gap at integration
time.

## Aligned and working

| Concern | Contract |
| --- | --- |
| Base URL | `NEXT_PUBLIC_API_BASE_URL` must include `/api/v1` |
| Error envelope | `{success:false,error:{code,message,request_id}}` — identical both sides |
| Success payload | Bare JSON. `request()` unwraps `{success,data}` if it ever appears, so either works |
| Auth transport | httpOnly `voltaris_session` cookie, set by the backend on login |
| CSRF | `voltaris_csrf` cookie echoed as `X-CSRF-Token`; enforced on cookie-authenticated mutations only |
| Roles | `BUYER · SELLER · DEALER · SALES_AGENT · FINANCE · CONTENT_MANAGER · ADMIN · SUPER_ADMIN` |
| Session shape | `GET /auth/session` → `{ user: { id, full_name, email, roles, email_verified, mfa_enabled } }` |
| Orders | `POST /orders` (+`Idempotency-Key`), `GET /orders` (cursor), `GET /orders/{id}` |
| Payments | `POST /orders/{id}/checkout-session`, `GET /orders/{id}/payment` |
| Google | `GET /auth/google/authorize`, `POST /auth/google/callback` |

### Why cookies rather than bearer tokens in the browser

The backend returns both. Browsers use the cookie because a token in `localStorage`
is readable by any injected script, so one XSS becomes account takeover; httpOnly
means the token is never exposed to JavaScript. That trade buys CSRF exposure, paid
for with the double-submit token. API and mobile clients use the bearer token and
skip CSRF entirely — an attacker able to set an `Authorization` header already has
the token.

ESLint blocks `localStorage` and `sessionStorage` in this repo to keep it that way.

## Not implemented in the backend yet

These are typed and called by the frontend. Each currently returns 404, and the
pages that use them render their real error or empty state rather than breaking.

| Endpoint | Blocks |
| --- | --- |
| `GET /vehicles`, `/vehicles/by-slug/{slug}`, `/vehicles/facets`, `/vehicles/{id}/similar`, `/vehicles/sitemap` | The marketplace, vehicle detail, category and brand pages, sitemap |
| `POST /vehicles/compare` | Comparison |
| `GET /dealers`, `/dealers/{slug}`, `/dealers/{slug}/vehicles` | Dealer directory and profiles |
| `POST /inquiries` | Enquiry form |
| `POST /test-drives`, `GET /test-drives/{ref}` | Test drive request and tracking |
| `GET/PATCH /me`, `/me/saved-vehicles`, `/me/saved-searches`, `/me/inquiries`, `/me/test-drives`, `/me/notifications` | The account area |
| `POST /seller-listings` | Seller onboarding (photos now work; the listing record itself does not) |
| `GET /content/articles`, `/content/articles/{slug}`, `/content/sitemap` | Guides **and** blog |
| `POST /inquiries` without `vehicle_id` | The homepage enquiry form |
| `GET /charging/locations` | Charging directory |
| `GET /admin/metrics`, `/admin/vehicles`, `/admin/leads`, `/admin/audit-logs` | Admin — partially superseded by `/console/*` |
| `POST /auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email` | Password reset and email verification |

**Vehicles first.** Everything visible on the marketplace depends on it, and the
frontend's SEO architecture (slugs, sitemap, structured data) is built around the
contract in `src/lib/api/vehicles.ts`.

## Superseded

The frontend's `/admin/*` calls predate the backend's `/console/*` super-admin
surface. `/console/overview` covers `/admin/metrics`; `/console/inspect` and
`/console/history/*` go considerably further. `src/lib/api/admin.ts` should be
repointed when the admin pages are next touched.

## Two naming decisions

`full_name`, not `name` — the frontend picked it first and it is the less ambiguous
of the two. The backend now matches on register, login, and session.

Cursor pagination, not page numbers, for `GET /orders`. `skip` costs O(offset) and is
unusable past a few thousand documents, so `CursorPage<T>` is a distinct type from
`Page<T>` rather than a variation on it.


## Two additions the backend must account for

**`kind` on content.** `/guides` and `/blog` share one store and one endpoint,
separated by `kind: 'guide' | 'blog'`. Guides are evergreen and edited in place;
posts are dated and immutable. `GET /content/articles?kind=blog` and
`GET /content/sitemap?kind=blog` are both required, and `ArticleSummary.kind` must
be present so `/blog/{slug}` can 404 a guide reached through the wrong route
rather than serving the same content at two URLs.

**General enquiries.** `POST /inquiries` must accept a body with **no**
`vehicle_id`, carrying `topic` and `source` instead. Route those to the sales
queue rather than to a seller — the person has not chosen a vehicle yet, which is
precisely the lead worth having. The form also submits a honeypot field
(`company_website`); reject any request where it is non-empty, and keep real rate
limiting behind it.


## Images

Settled and built. Cloudflare R2, presigned direct upload, four pre-derived
variants produced by a backend worker.

| Endpoint | Purpose |
| --- | --- |
| `POST /media/intents` | One presigned PUT per file, into quarantine |
| `POST /media/finalize` | Validate, strip EXIF, re-encode, publish, delete the original |

The browser PUTs straight to R2 with plain `fetch` — **not** the API client, since
it must not carry our session cookie or CSRF header to a third-party host. The
content type must match what was presigned exactly; it is inside the signature.

`R2_PUBLIC_BASE_URL` on the backend must match `remotePatterns` in
`next.config.mjs`, or `next/image` refuses to load anything from the bucket.

Full reasoning in the backend's `MEDIA.md`.
