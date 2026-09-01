# AI-009 — Image asset loading fix

## Asked
- Fix the app so the beer images show correctly.

## Decisions
- Replaced string-based local image URIs with bundled React Native image sources.
- Kept the existing catalog and manifest data flow, but resolved image files through a static asset map so Expo can bundle them reliably.

## Changed
- Updated `src/types/beer.ts` to store `localImage` as a React Native image source.
- Updated `src/data/sampleBeers.ts` to map each `imageFile` to a bundled `require(...)` asset.
- Updated `src/components/BeerCard.tsx` and `App.tsx` to pass bundled image sources directly to `Image`.
