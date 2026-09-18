# AI-023 — Category filter

## Asked

- Add a way to filter the beer catalogue by the agreed grouped categories.

## Decisions

- Kept the existing tried and rated filters independent, so category filtering composes with them and search.
- Used the user-facing groups: Lager, IPA, Fruit & flavoured, Ale, Wheat beer, and Stout.

## Changed

- Added category filter chips to the catalogue controls.
- Mapped individual source styles into their corresponding grouped category for filtering.
