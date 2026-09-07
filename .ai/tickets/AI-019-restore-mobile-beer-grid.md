# AI-019 — Restore mobile beer grid

## Asked
- Fix the web app beer catalog, which became a single-column list after the native-to-web migration.

## Decisions
- Restored the original two-column layout at phone widths.
- Kept the responsive auto-filling grid for tablet and desktop widths.

## Changed
- Updated `src/styles.css` so the beer catalog uses two equal columns below 640px and 210px minimum columns on wider screens.
