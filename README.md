# Voltaris Mobility — Web Frontend

Rwanda-focused electric vehicle marketplace. Next.js 16 (App Router), TypeScript
strict, Tailwind. 41 routes covering the public marketplace, seller onboarding,
authentication, checkout, and the internal admin surface.

## Running it

```bash
cp .env.example .env.local   # fill in NEXT_PUBLIC_API_BASE_URL
npm install
npm run dev
```

| Command             | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Development server                                  |
| `npm run build`     | Production build                                    |
| `npm run typecheck` | `tsc --noEmit`, strict + `noUncheckedIndexedAccess` |
| `npm run lint`      | ESLint                                              |
| `npm test`          | Vitest — 33 unit tests                              |
| `npm run e2e`       | Playwright, desktop and mobile viewports            |

## The backend is not live yet

Every endpoint is declared as a typed contract in `src/lib/api/` with a
`BACKEND DEPENDENCY` comment naming the routes. Nothing is mocked or stubbed with
sample data — pages that cannot reach the API render their real error and empty
states, which is why the build prerenders 30 pages against a dead backend without
failing. When the API arrives, only `src/lib/api/` should need touching.

`src/types/api.ts` documents the single assumption made about the response envelope:
the error shape is fixed by the brief, the success shape is assumed to be
`{ success: true, data: T }`. If it differs, change `request()` in `client.ts` only.

## What is here

**Public** — homepage, marketplace with URL-driven filters, vehicle detail, enquiry,
test drive request and public status tracking, comparison, seller listing flow,
dealer directory and profiles, brand directory and profiles, five curated SEO landing
pages, editorial index and articles, charging directory.

**Account** — profile, saved vehicles, saved searches, enquiries, test drives, orders,
notifications.

**Auth** — register, sign in with an MFA branch, sign out, forgot and reset password,
email verification.

**Checkout** — order creation, provider-hosted payment, and a status view that reads
reconciled state from the backend.

**Admin** — dashboard, listing review queue with publish/reject, leads, audit log.

## Documents

- `ARCHITECTURE.md` — layering, state, caching, backend dependencies, security posture
- `SEO.md` — indexation policy, metadata system, structured data
- `DEVELOPMENT.md` — where things go, conventions
- `ENVIRONMENT.md` — every variable and why it is or is not public
- `ANALYTICS.md` — the event contract and what never leaves the browser
- `DEPLOYMENT.md` — pipeline, environments, pre-launch checklist

## Credits

Design and build: **Patrice**. The credit renders in the footer and is configured in
`src/content/home.ts` under `credits` — add a `url` to make the name a link, or extend
`people` to cover more than one contributor.
