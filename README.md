# scrape-and-bake

`scrape-and-bake` is a benign cookie ingredient supply-chain demo with a synthetic scrape timeline.

It preserves the existing interaction model where practical:
- company network views
- company profile drawers
- ingredient drilldowns
- source evidence drilldowns
- row-level provenance and source traceability
- local demo data adapter behavior

The packaged dataset is synthetic and regenerated from local scripts for public walkthroughs.

## What Is Included

- `frontend/`: Static demo frontend backed by a local mock data adapter.
- `data/seed/csv/`: Schema-compatible seed CSVs.
- `data/seed/sql/`: Seed SQL plus compatibility views and lightweight RPCs for Supabase/Postgres.
- `scripts/generate_cookie_demo_assets.py`: Rebuilds seed CSVs, SQL, the frontend demo dataset, and synthetic scrape fixture outputs.
- `scripts/scrape_cookie_supply_chain.py`: Small public-page scraper/parser that writes raw HTML, parsed evidence CSV, and `scrape_summary.json`.
- `scraper_output/`: Fixture output folders for each simulated scrape run.
- `CHANGELOG.md`: Public terminology changes for the demo wording.
- `RENDER.md`: Render deployment notes.

## Local Frontend Setup

1. `cd frontend`
2. `npm install`
3. `npm run dev`

The demo frontend uses packaged local data. No Supabase env vars are required for the default demo experience.

## Rebuild Demo Assets

Run this any time you want to regenerate the synthetic dataset and derived frontend assets:

```bash
cd .
python3 scripts/generate_cookie_demo_assets.py
```

That script updates:
- `data/seed/csv/*.csv`
- `data/seed/sql/01_cookie_demo_seed.sql`
- `data/seed/sql/02_cookie_demo_compat_views.sql`
- `frontend/src/data/demoData.js`
- `scraper_output/<run-id>/...`

The current seed contains 38 `EVIDENCE` rows, safely under the requested 100-row cap.

## Synthetic Scrape Timeline

The synthetic dataset simulates five public collection runs over time:

- `2026-04-01 BakeryBoard`: initial bakery and menu collection
- `2026-04-15 IngredientHub`: supplier catalog collection
- `2026-05-01 WholesaleCrumb`: distributor collection
- `2026-05-20 CertiBake Registry`: public claim and allergen collection
- `2026-06-10 BakeryBoard Refresh`: refreshed bakery pages with new sourcing context

In the frontend, the time selector shows the network and source evidence “as of” the selected run date.

As the selected run advances, the demo updates:
- dashboard stat cards
- visible companies and ingredients
- network graph nodes and edges
- source evidence and provenance drawers
- movement summaries describing what changed in the selected run

## Fixture Scrape Output Folders

Each synthetic scrape run writes a fixture folder under `scraper_output/`, for example:

- `scraper_output/2026-04-01_bakeryboard/`
- `scraper_output/2026-04-15_ingredienthub/`
- `scraper_output/2026-05-01_wholesalecrumb/`
- `scraper_output/2026-05-20_certibake_registry/`
- `scraper_output/2026-06-10_bakeryboard_refresh/`

Each folder contains:
- `raw_html/*.html`
- `parsed_evidence.csv`
- `scrape_summary.json`

These are fixture outputs for public walkthroughs and local demos. They are meant to show the collection flow from raw page capture to parsed evidence summary.

## Optional Database Loading

If you want a Supabase/Postgres version that matches the existing table and query surface more closely:

1. Create a database with the compatible base tables.
2. Run `data/seed/sql/01_cookie_demo_seed.sql`.
3. Run `data/seed/sql/02_cookie_demo_compat_views.sql`.

Core tables preserved in the seed:
- `COMPANY`
- `CONSOLIDATED_COMPANY`
- `SUBSTANCE_REFERENCE`
- `SUBSTANCE_TYPE`
- `EVIDENCE`
- `EVIDENCE_TYPE`
- `DATA_SOURCE`
- `LINKAGE`
- `ASSOCIATION`
- `WEIGHTING_TAG`

Additional support tables are also included where they help preserve UI behavior.

## Provenance Fields

The seed and fixture outputs include:
- source URL
- scrape run ID
- source platform
- observed date
- evidence type
- record ID
- date logged
- first seen / last seen fields where relevant

In the frontend, `SUBSTANCE_REFERENCE` is relabeled as `Ingredient` only at the UI layer. Table names remain schema-compatible.

## Public-Page Scraper

Run the scraper from the demo root:

```bash
cd .
python3 scripts/scrape_cookie_supply_chain.py
```

If public network access is unavailable, the scraper writes clearly labeled fixture-fallback HTML so the raw HTML → parsed CSV → summary workflow still remains demonstrable in local or sandboxed environments.

## Render Deployment

Use the static-site flow in `RENDER.md`, or deploy directly from `render.yaml`.

This demo frontend builds as a static site:
- build root: `scrape-and-bake/frontend`
- build command: `npm install && npm run build`
- publish directory: `dist`

No runtime secrets are required for the default demo mode.
