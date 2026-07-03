# Render Deployment Notes

## Recommended Service Type

Create a Render `Static Site`.

## Settings

- Root Directory: `scrape-and-bake/frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

## Environment

No environment variables are required for the default packaged demo.

The frontend uses a local mock data adapter and does not need a live Supabase project unless you intentionally refactor it to do so.

## Deploy Flow

1. Push `scrape-and-bake/` to its own repository, or keep it in a monorepo and point Render at this folder.
2. Create a new Static Site in Render.
3. Set the root/build/publish settings above.
4. Deploy.

## Optional Customizations

- If you want a dedicated repo, keep this folder as the repo root and preserve the relative paths under it.
- If you later swap the mock adapter for a live Supabase backend, add the required `VITE_*` variables in Render before deploying that version.

## Validation Checklist

- `npm run build` passes in `scrape-and-bake/frontend`
- home view loads without auth setup
- company graph renders
- ingredient drawer opens
- source evidence drawer rows show provenance fields
- Data Explorer export works
