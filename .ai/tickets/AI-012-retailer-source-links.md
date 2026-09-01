# AI-012 — Retailer source links and retailer registry

## Asked
- Extend the beer data to have a link to the retail webpage it was found from.
- Also have a file referencing all the retailers.

## Decisions
- The catalog already carried `sourceUrl` and `retailer` per beer from AI-011, so the missing pieces were a canonical retailer registry and surfacing the link in the UI, not a data re-scrape.
- Sized the registry from the retailer values actually present in the 331 entries rather than the scraper config: The Alcohol Free Co (224), Wise Bartender (70), Ocado (34, from the original 57 entries) and Dry Drinker (3) — four retailers, not three.
- Kept the registry as JSON plus a small typed accessor module, matching the existing catalog/manifest pattern.
- Resolved a beer to its retailer by `sourceUrl` host with a retailer-name fallback, and derived `retailerId` in the `sampleBeers` mapper, so no 331-row JSON rewrite was needed.
- Rendered the link as a `Pressable` calling `Linking.openURL` with `accessibilityRole="link"`, showing both the retailer name and the URL, in place of the static retailer chip.

## Changed
- Added `src/data/catalog/retailers.json` with the four UK retailers (id, name, website, host, country, description).
- Added `src/data/retailers.ts` exposing `beerRetailers` plus `retailerForSourceUrl`, `retailerByName` and `retailerById` lookups.
- Added the `Retailer` type and a `retailerId` field to `src/types/beer.ts`.
- Wired `retailerId` through the mapper in `src/data/sampleBeers.ts`.
- Replaced the retailer chip on the detail screen in `App.tsx` with a tappable source link and its styles.
- Verified all 331 `sourceUrl` values are https and resolve to a registry host, `npx tsc --noEmit` is clean, and the app bundles (1036 modules) and loads in Expo Go without runtime errors.
