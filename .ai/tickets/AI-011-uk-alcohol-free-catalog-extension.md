# AI-011 — UK alcohol-free catalog extension

## Asked
- The beer list seems to be incomplete. Look again for alcohol-free beers sold in the UK and extend the list.

## Decisions
- Sourced candidates from three UK alcohol-free retailers (The Alcohol Free Co, Wise Bartender, Dry Drinker) rather than hand-curating, and preferred the earlier retailer in that order when the same drink appeared on several sites.
- Filtered out non-beer and non-single-product listings (cider, wine, spirits, mixed cases, gift sets, glassware, soft drinks) by product type, tags and title patterns.
- Deduplicated in layers because the same beer appears with different titles across retailers: normalised name tokens, style-word-trimmed keys, brand-aware subset matching, similarity scoring, source URL, and an md5 hash of the downloaded image.
- Accepted a small number of genuine near-duplicates rather than risk collapsing distinct beers (e.g. "Lucky Saint" vs "Lucky Saint Hazy").
- Kept the existing offline-friendly image architecture from AI-009: downloaded each image at CDN width 500 and bundled it locally through the static `require(...)` map instead of switching to remote URIs.
- Switched the list screen to `FlatList` so 331 cards and images are virtualised instead of all mounted at once.

## Changed
- Extended `src/data/catalog/zeroBeersCatalog.json` from 57 to 331 beers with sequential ids.
- Regenerated `src/data/catalog/zeroBeersImageManifest.json` for all 331 entries.
- Added 274 bundled images to `assets/beer-images/`.
- Regenerated the `beerImages` require map in `src/data/sampleBeers.ts`.
- Replaced the `ScrollView` grid in `App.tsx` with a virtualised `FlatList`, and restored the missing `ratingStars` constant that was breaking the typecheck.
