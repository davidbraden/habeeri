# AI-007 — Real beer catalog UI

## Asked
- Replace the stub app with the real beer data and images.
- Add a screen showing all beers with search and filtering.
- Show a visual indicator for beers already drunk.
- Let tapping a beer open a screen to mark it drunk, rate it, and add comments.

## Decisions
- Kept navigation lightweight with local state instead of adding a navigation dependency.
- Reused the bundled beer image assets directly with static `require` mappings so Expo can resolve them reliably.
- Normalised the catalog JSON into a richer `Beer` shape with local per-beer log state for drunk status, rating, comments, and tried date.
- Seeded a few example tasting logs so the list immediately demonstrates drunk/rated states.

## Changed
- Updated `App.tsx` to implement a catalog screen, search/filter controls, summary stats, and a beer detail editor screen.
- Reworked `src/components/BeerCard.tsx` into a tappable catalog card with images, status badges, and rating preview.
- Replaced the sample-only model in `src/data/sampleBeers.ts` with real catalog-backed data mapping.
- Expanded `src/types/beer.ts` to describe catalog fields and user tasting-log state.
