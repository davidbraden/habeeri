# AI-013 — Catalog generation pipeline with multi-retailer availability

## Asked
- Formalise catalog generation into a script that can be re-run.
- Keep the four existing retailers and add Tesco, Sainsbury's, Asda, Morrisons, Waitrose.
- Separate the per-retailer pull from the merge step.
- List every retailer stocking a beer instead of just one.
- Do not touch the UI yet.

## Decisions
- Split into `catalog:pull` (writes one JSON snapshot per retailer) and `catalog:merge` (snapshots + existing catalog to `src/data/catalog/`). Snapshots on disk mean a slow or blocked retailer cannot corrupt the catalog, and merge can be re-run without re-fetching.
- Made the schema change purely additive so the UI keeps working untouched: each record gains a `retailers[]` array, and the existing scalar `retailer` / `sourceUrl` / `availability` fields now mirror `retailers[0]`, ordered by a fixed retailer preference.
- Preserved ids and image filenames for existing records, since both key the generated `require` map and the stored tasting logs. New beers take `max(id) + 1`.
- Kept beers that no longer appear anywhere, marking availability `Not seen in latest check`, rather than deleting records whose images are already bundled.
- A retailer with no snapshot this run keeps its previously known listings, so a failed pull degrades coverage for that run without erasing data.
- Established per-retailer feasibility rather than assuming it. Seven of nine are scriptable: three Shopify `products.json` endpoints; Ocado and Morrisons share a storefront platform whose category pages embed `__INITIAL_STATE__`; Tesco and Sainsbury's are server-rendered tile grids.
- Tesco's edge rejects HTTP/1.1 and Node's `fetch` cannot speak HTTP/2, so that source is fetched through a `curl --http2` subprocess.
- Ocado and Morrisons category pages render only their first ~48 products and offer no paging parameter, and their `/api/` endpoints are disallowed by `robots.txt`, so coverage comes from walking the child categories each page advertises.
- Asda and Waitrose block every non-browser client, so they read from a saved page under `scripts/catalog/manual/` and are reported as failed when absent. Asda's `robots.txt` also disallows automated agents. No proxies, CAPTCHA services, borrowed cookies or fingerprint spoofing were used.
- Restricted the beer-word filter to terms that are only ever beer. A first attempt also trusted supermarket category labels and words like "pale" and "amber", which pulled wine, gin and cocktails into the catalog from the low-and-no aisles.
- Rewrote name cleaning for supermarket title idioms. `"0.0% Alcohol Free Lager"` previously matched a trailing-marketing rule that ran from the percentage to end of line, stripping the style words and leaving a bare brand.

## Changed
- Added `scripts/catalog/` — `pull.mjs`, `merge.mjs`, nine source adapters, and shared libs for HTTP, normalisation, snapshots, Shopify, the Ocado platform, embedded-JSON harvesting and saved pages. No new dependencies.
- Added `catalog:pull`, `catalog:merge` and `catalog:build` scripts to `package.json`.
- Grew `zeroBeersCatalog.json` from 331 to 361 beers; 232 now list more than one retailer.
- Added `retailers[]` to every record and 30 images to `assets/beer-images/`, and regenerated the image manifest and the `beerImages` require map.
- Extended `retailers.json` from four to nine retailers.
- Gitignored snapshots and saved retailer pages, and documented the pipeline in `scripts/catalog/README.md`.

## Notes
- Current per-retailer coverage: The Alcohol Free Co 250, Dry Drinker 202, Wise Bartender 159, Ocado 64, Tesco 25, Sainsbury's 24, Morrisons 19.
- Dedupe deliberately under-merges; Ocado's "Beck's German Lager" stays separate from the existing "Becks Blue". Collapsing distinct beers loses one permanently, so the odd duplicate pair is the cheaper error.
- The UI was not changed, so `retailers[]` is not surfaced yet — a beer still shows a single retailer.
