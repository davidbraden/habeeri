# AI-010 — Compact grid list screen

## Asked
- Make the beer list screen show more beers at once.
- Remove descriptions and extra copy from the list cards.
- Simplify the top area and remove wasted vertical space.

## Decisions
- Switched the list cards to a compact two-column grid to increase density.
- Reduced each beer card to image plus name only, with a tiny status/rating marker.
- Replaced the large intro and stats area with a minimal top bar and tighter filters.

## Changed
- Updated `src/components/BeerCard.tsx` to a compact grid card layout.
- Updated `App.tsx` to remove the large header/summary section and tighten controls.
- Kept detail-screen behaviour unchanged.
