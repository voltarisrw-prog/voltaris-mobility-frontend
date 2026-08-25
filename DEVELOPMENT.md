# Development

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Commands

| Command             | What it does                                             |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Development server                                       |
| `npm run build`     | Production build                                         |
| `npm run typecheck` | `tsc --noEmit` under strict + `noUncheckedIndexedAccess` |
| `npm run lint`      | ESLint                                                   |
| `npm test`          | Vitest                                                   |
| `npm run e2e`       | Playwright (builds and serves, or set `E2E_BASE_URL`)    |
| `npm run format`    | Prettier                                                 |

## Where things go

Adding a **public page**: route in `src/app/`, `buildMetadata()` for its metadata, data
through a function in `src/lib/api/`. Never `fetch()` in a component.

Adding an **API call**: a typed function in the matching `src/lib/api/` module, with a
`BACKEND DEPENDENCY` comment naming the route. Set `auth: true` if it needs a session —
without it, server-side rendering will not forward the cookie and the call returns 401.

Adding a **form**: schema in `src/lib/validation/schemas.ts`, form in
`src/features/<area>/`, `<Field>` from `src/components/ui` for the label and error
wiring. Client validation is a courtesy; the backend re-validates everything.

Adding an **SEO landing page**: an entry in `src/config/landing.ts` with real editorial
copy and FAQs, plus a six-line route file. If there is nothing to write, the page
should not exist.

## Client Components

Default to Server Components. Reach for `'use client'` only when something needs state,
an effect, or a browser API. Current client components: the filter panel, the forms,
the comparison table, the checkout poller, the toast host, and two analytics beacons.
That list should stay short.

## Conventions worth knowing

- Filters live in the URL, never in a store.
- `localStorage` is blocked by ESLint. Sessions are httpOnly cookies.
- Ochre (`laterite`) is a data colour for range and battery only — never a CTA.
- Every list has an empty state with a way forward, not just a blank area.
