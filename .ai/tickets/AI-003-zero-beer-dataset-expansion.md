# AI-003 — Zero beer dataset expansion

## Asked
- Recover the previous zero-beer work from `tmp`.
- Expand the dataset from a narrower zero-beer list to a broader UK no/low beer set up to 0.5% ABV.
- Re-check source coverage and confirm each included item has a description and picture.

## Decisions
- Reused the saved local source snapshots in `/tmp/zero_beers_products.json` and `/tmp/ocado_zero.html` rather than pulling fresh network data.
- Expanded scope from “selected labelled zero beers” to a deduped UK no/low beer catalog sourced from the saved specialist retailer and Ocado snapshots.
- Kept one row per named product variant family rather than collapsing all can/bottle differences into a single brand row.
- Filled missing descriptive coverage with curated fallback copy where the saved Ocado snapshot did not expose long-form descriptions.

## Changed
- Replaced `tmp/pdfs/prepare_zero_beer_catalog.mjs` with a broader extractor that:
- reads both saved source snapshots,
- includes 0.0%, 0%, 0.3%, and 0.5% beers,
- dedupes products across sources,
- prefers bottle variants over can variants when the same drink appears in both formats,
- writes refreshed `tmp/pdfs/zero_beers_catalog.json`, and
- writes refreshed `tmp/pdfs/image_urls.tsv`.
- Regenerated the catalog to `57` entries after collapsing same-drink package duplicates.
- Verified the regenerated dataset has `0` missing descriptions and `0` missing image URLs.
- Copied the final JSON into `src/data/catalog/zeroBeersCatalog.json` for Expo bundling.
- Copied the current local image folder into `assets/beer-images/` for app use.
- Downloaded the remaining missing product images and reconciled filenames so `assets/beer-images/` now matches the final catalog one-to-one.
