# Visitor Map

A browser-only "visitor atlas": mark your own visit near one of five fixed cities, based only on your browser time
zone, or add simulated visitors; dots and a city register show the marks. Nothing is looked up or sent anywhere, and
it is not analytics.

Live: https://visitor-map.bookchaowalit.com (deployed by Vercel CLI; it can lag `main`, see `PRODUCT.md`).

## What it does

- "Mark my visit" maps the browser time zone (including legacy names and Atlantic zones) to the nearest of Bangkok,
  Tokyo, Berlin, San Francisco or Sydney; other zones get a clear "not near any city" notice.
- "Simulate visitor" adds a random mark; "Clear field" removes all. The newest 40 marks are kept in `localStorage`
  and validated on load (bad JSON, unknown cities and duplicate ids dropped).
- The city register counts marks per city (and how many are yours) and highlights a city on the map.

## What it does not do

- No IP or geolocation lookup, no map provider, no real visitors, no remote analytics, no zoom or time filters.

## Run

```bash
npm ci
npm run dev
```

## Checks

```bash
npm test           # Vitest: time-zone mapping and marks, MCP handler + route, site/robots/sitemap, home render, Sentry
npm run lint
npm run typecheck
npm run build
```

CI (`.github/workflows/ci.yml`) runs the shared Node workflow (with a line-coverage gate) and the shared security
scan on every push and PR to `main`.

## Configuration

- `NEXT_PUBLIC_SITE_URL` (optional): canonical origin for metadata, `/sitemap.xml`, `/robots.txt` and the MCP app
  info. Defaults to `https://visitor-map.bookchaowalit.com`; must be an absolute http(s) URL.
- `NEXT_PUBLIC_SENTRY_DSN` (optional): turns on error reporting; unset means Sentry is off.

## Code map

- `lib/visits.ts`: the fixed city set, time-zone mapping, simulated marks, counting and stored-mark parsing.
- `lib/use-stored-state.ts`: state mirrored to `localStorage`, read after mount.
- `lib/mcp.ts` + `app/api/mcp/route.ts`: JSON-RPC endpoint with one `get_app_info` tool (static app descriptor; the
  marks live only in the visitor's browser, so there is nothing else to serve).
- `lib/site.ts`: canonical URL, robots and sitemap.
- `lib/sentry.ts` + `instrumentation*.ts`: error reporting to Sentry, errors only, personal data stripped.
- `lib/related-projects.ts` + `app/more-projects/page.tsx`: portfolio link page (copied per repository, not a package).
