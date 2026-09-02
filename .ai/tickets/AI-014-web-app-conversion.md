# AI-014 — Web app conversion

## Asked
- Change the existing native-style app into a web app.

## Decisions
- Replaced the Expo / React Native shell with a Vite + React browser app instead of keeping a hybrid Expo setup.
- Kept the existing beer catalogue, ratings flow, comments, and retailer links so the behaviour stayed familiar.
- Added browser `localStorage` persistence so the web version remains local-only and does not lose notes on refresh.

## Changed
- Updated `package.json` scripts and dependencies for a browser build and removed Expo-specific tooling.
- Added `index.html`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, and `src/styles.css` for the new web entrypoint and UI.
- Reworked `src/components/BeerCard.tsx`, `src/data/sampleBeers.ts`, and `src/types/beer.ts` to use web image loading and DOM-friendly types.
- Updated `README.md` to document local browser development and build steps.
