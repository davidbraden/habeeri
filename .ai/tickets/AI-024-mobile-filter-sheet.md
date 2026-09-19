# AI-024 — Mobile filter sheet

## Asked

- Replace the catalogue's permanently expanded filters with the agreed compact filter-sheet pattern.

## Decisions

- Kept the high-frequency All, Tried, and To try controls in the catalogue; category and rating filters now live in a bottom sheet.
- Expose active filter count and labels on the trigger, and retain immediate filtering with an explicit results-count close action.
- Support close button, backdrop click, Escape, initial focus, and scroll locking while the sheet is open.

## Changed

- Added the responsive filter-sheet UI and its reset, category, and only-rated controls.
- Removed the persistent category chips and rating checkbox from the catalogue controls.
