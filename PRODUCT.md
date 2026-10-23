# Visitor Map — Product truth

> Inferred from the code and copy (no user interview). Checked against the portfolio card claims review
> (`portfolio-site-web/docs/audits/CARD-CLAIMS-REVIEW-2026-10.md`, row `visitor-map`, evidence Live→Prototype:
> real-time geolocation plotting, zoom/time-range filters and localisation insights were removed) on 2026-10-23.

## What it is

A client-only toy map: five fixed cities on an abstract projection, with marks from the visitor's own time zone or
from a "simulate" button, kept in this browser's `localStorage`.

## Who it is for

A portfolio visitor looking at a small, honest data-display UI. It is not an analytics tool.

## What works today

1. "Mark my visit" snaps the browser time zone to the nearest of Bangkok, Tokyo, Berlin, San Francisco or Sydney
   (legacy zone names and American Atlantic zones included); zones far from all five get an explanatory notice.
2. "Simulate visitor" adds a random city mark; "Clear field" removes every mark. The newest 40 marks are kept.
3. Dots on the map and a city register (count per city, how many are yours); selecting a city highlights it.
4. Stored marks are validated on load: bad JSON, unknown cities and duplicate ids are dropped.
5. `/api/mcp` answers JSON-RPC (`initialize`, `ping`, `tools/list`, `tools/call`) with one honest `get_app_info` tool;
   unknown tools and methods return JSON-RPC errors.
6. Front-end and server errors go to Sentry (errors only, personal data stripped) when `NEXT_PUBLIC_SENTRY_DSN` is set.

## What does not work (and must not be claimed)

- No IP or GPS geolocation, no real visitors, no map provider, no zoom or time-range filters, no insights.
- No account, sharing or sync; clearing site data deletes the marks.

## Live URL and deploy state

- Live: https://visitor-map.bookchaowalit.com (HTTP 200 on 2026-10-23).
- The Vercel project `bookchaowalit-visitor-map-frontend` is deployed by CLI only. Its Git link names the old
  repository (`bookchaowalit/bookchaowalit-visitor-map-frontend`), so a push to `main` does not deploy. The last
  production deploy is 2026-10-08 (CLI, commit 3ba2ac9): the CVE patch deploy did not run because Vercel's free plan
  hit its 100-deployments/day limit on 2026-10-23. The coordinator deploys the latest green `main` after the quota
  resets; reconnecting Vercel Git to this repository is owner action D9.
- `NEXT_PUBLIC_SENTRY_DSN` is set on the Vercel project (Sentry project `marketing-visitor-map-web`, org
  `personal-yu0`); it takes effect on the next deploy.

## Boundaries

- Browser-only apart from the stateless `/api/mcp` route. The time zone is read in the browser and never sent.
