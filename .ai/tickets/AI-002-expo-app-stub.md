# AI-001 — Expo app stub

## Asked
- Create a basic native iOS/Android app stub with Expo for tracking zero alcohol beers.
- Keep all data inbuilt and local only.
- Allow each beer to be rated and commented on.

## Decisions
- Used a minimal Expo + TypeScript structure to keep the project easy to extend.
- Seeded the app with a small inbuilt beer catalogue rather than adding persistence yet.
- Kept ratings and comments local in component state as a stub, ready for `AsyncStorage` later.

## Changed
- Added Expo project files including `package.json`, `app.json`, `tsconfig.json`, and `babel.config.js`.
- Added `App.tsx` with a simple home screen and beer list.
- Added `src/components/BeerCard.tsx` for per-beer rating and comment UI.
- Added `src/data/sampleBeers.ts` and `src/types/beer.ts` for inbuilt sample data.
- Added `README.md` with setup instructions and suggested next steps.
