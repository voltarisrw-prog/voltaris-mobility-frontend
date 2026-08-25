# Environment

Copy `.env.example` to `.env.local`. Nothing in this repo needs a secret to run.

## The rule

`NEXT_PUBLIC_*` is compiled into the browser bundle. Anyone can read it. Everything
else is server-only and never reaches the client.

If a value would be damaging in a browser devtools panel, it does not get the prefix,
and if it does not get the prefix it cannot be read from a Client Component. That
constraint is the point, not an inconvenience to route around.

| Variable                              | Scope  | Required | What it is                                                                                                          |
| ------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                | public | yes      | Canonical origin. Drives canonicals, Open Graph, and the sitemap.                                                   |
| `NEXT_PUBLIC_API_BASE_URL`            | public | yes      | Backend base URL for browser calls.                                                                                 |
| `NEXT_PUBLIC_MEDIA_BASE_URL`          | public | yes      | CDN origin for vehicle media. Must match `next.config.mjs` `remotePatterns`.                                        |
| `NEXT_PUBLIC_ANALYTICS_WRITE_KEY`     | public | no       | Write key only. Never a read or admin key.                                                                          |
| `NEXT_PUBLIC_ENVIRONMENT`             | public | yes      | `development` \| `staging` \| `production`. Anything but `production` makes robots.txt disallow everything.         |
| `NEXT_PUBLIC_PAYMENT_PUBLISHABLE_KEY` | public | no       | Publishable key. The secret key lives in the backend and must never appear here.                                    |
| `API_INTERNAL_BASE_URL`               | server | no       | Internal URL for server-rendered calls, so SSR does not traverse the public internet. Falls back to the public URL. |
| `API_SERVER_TIMEOUT_MS`               | server | no       | Request timeout, default 8000.                                                                                      |
| `REVALIDATE_SECRET`                   | server | no       | Shared secret for backend cache-purge webhooks.                                                                     |

## Environments

`development` and `staging` both serve `Disallow: /` from robots.txt. A staging site
that gets indexed competes with production for the same keywords and is very hard to
clean up afterwards, so the guard is automatic rather than a checklist item.

## Failing fast

The API client throws at first use if the base URL is missing, rather than defaulting
to something plausible. A build that quietly points at the wrong backend is worse than
a build that stops.
