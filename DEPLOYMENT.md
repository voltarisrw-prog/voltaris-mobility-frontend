# Deployment

## Pipeline

`.github/workflows/ci.yml` runs: lint → typecheck → unit tests → dependency audit and
secret scan → build → E2E against staging → deploy.

`develop` deploys to staging automatically. `main` deploys to production behind a
GitHub environment approval.

## Environments

|             | Branch    | robots.txt    | Notes                          |
| ----------- | --------- | ------------- | ------------------------------ |
| Development | any       | `Disallow: /` | Local only                     |
| Staging     | `develop` | `Disallow: /` | Real backend, real data shapes |
| Production  | `main`    | crawlable     | Manual approval to deploy      |

The robots behaviour follows `NEXT_PUBLIC_ENVIRONMENT`, not the hostname, so a preview
deployment cannot be indexed by accident.

## Host requirements

- Node 22
- Streaming SSR (the app uses Server Components and dynamic routes)
- The proxy at `src/proxy.ts` must run at the edge or in front of the app
- CDN in front of static assets and `next/image`

## Before the first production deploy

1. Set every variable in `ENVIRONMENT.md` for the production environment.
2. Point `NEXT_PUBLIC_MEDIA_BASE_URL` at the real CDN and add its hostname to
   `remotePatterns` in `next.config.mjs` — `next/image` refuses unlisted hosts.
3. Wire the backend cache-purge webhook to Next's `revalidateTag`, using the tags
   exported from `lib/api/vehicles.ts`. Without it, a sold vehicle stays visible for
   up to five minutes.
4. Submit `/sitemap.xml` in Search Console and confirm `/admin` and `/account` are
   absent from it.
5. Check `X-Robots-Tag: noindex` is present on `/admin` and `/account` responses —
   headers survive misconfigured robots.txt, and this is the layer that matters.

## Rollback

Deploys are immutable builds; roll back by redeploying the previous build. There is no
frontend state to migrate. If a bad build shipped alongside a backend change, roll the
frontend back first — the API contracts are versioned and the older build will keep
working against the newer backend.
