# scrape-and-bake

`scrape-and-bake` is a benign cookie ingredient supply-chain demo.

It keeps the existing interaction model where practical:
- company network views
- company profile drawers
- ingredient drilldowns
- source evidence drilldowns
- row-level provenance and source traceability

It does not reuse or ship any TraCCC dataset rows. The packaged demo data is synthetic and regenerated from local scripts.

## What Is Included

- `frontend/`: Static demo frontend backed by a local mock data adapter.
- `data/seed/csv/`: Schema-compatible seed CSVs.
- `data/seed/sql/`: Seed SQL plus compatibility views/RPCs for Supabase/Postgres.
- `scripts/generate_cookie_demo_assets.py`: Rebuilds seed CSVs, SQL, and the frontend demo dataset.
- `scripts/scrape_cookie_supply_chain.py`: Small public-page scraper/parser that writes raw HTML, parsed evidence CSV, and `scrape_summary.json`.
- `scripts/public_cookie_targets.json`: Editable list of public bakery/supplier/catalog targets for the scraper.
- `scraper_output/`: Default output location for scraper runs.
- `CHANGELOG.md`: Terminology changes for the public demo wording.
- `RENDER.md`: Render deployment notes.

## Local Frontend Setup

1. `cd /Users/kristinalonge/Desktop/TraCCC Project/traccc-data-explorer/scrape-and-bake/frontend`
2. `npm install`
3. `npm run dev`

The demo frontend uses packaged local data. No Supabase env vars are required for the default demo experience.

## Rebuild Demo Assets

Run this any time you want to regenerate the benign dataset and derived frontend assets:

```bash
cd /Users/kristinalonge/Desktop/TraCCC Project/traccc-data-explorer/scrape-and-bake
python3 scripts/generate_cookie_demo_assets.py
```

That script updates:
- `data/seed/csv/*.csv`
- `data/seed/sql/01_cookie_demo_seed.sql`
- `data/seed/sql/02_cookie_demo_compat_views.sql`
- `frontend/src/data/demoData.js`

The current seed contains 42 `EVIDENCE` rows, safely under the requested 100-row cap.

## Optional Database Loading

If you want a Supabase/Postgres version that matches the existing table/query surface more closely:

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

The seed and scraper outputs include the requested provenance fields:
- source URL
- scrape run ID
- evidence type
- record ID
- date logged

In the frontend, `SUBSTANCE_REFERENCE` is relabeled as `Ingredient` only at the UI layer. Table names remain schema-compatible.

## Public-Page Scraper

Run the scraper from the demo root:

```bash
cd /Users/kristinalonge/Desktop/TraCCC Project/traccc-data-explorer/scrape-and-bake
python3 scripts/scrape_cookie_supply_chain.py
```

Outputs land in `scraper_output/example_run/`:
- `raw_html/*.html`
- `parsed_evidence.csv`
- `scrape_summary.json`

Notes:
- The scraper is intentionally lightweight and uses only the Python standard library.
- It is keyword-based, so it is easy to retarget for other benign bakery/supplier pages.
- If public network access is unavailable, the script writes clearly labeled fixture-fallback HTML so the raw HTML → parsed CSV → summary workflow still remains demonstrable in local or sandboxed environments.

## Render Deployment

Use the static-site flow in `RENDER.md`, or deploy directly from `render.yaml`.

This demo frontend builds as a static site:
- build root: `scrape-and-bake/frontend`
- build command: `npm install && npm run build`
- publish directory: `dist`

No runtime secrets are required for the default demo mode.
