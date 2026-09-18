# AI-021 — Browser-history beer navigation

## Asked

- Make browser Back and Forward work when opening and leaving beer details.

## Decisions

- Represent the selected beer in the `beer` URL parameter so a detail page has a shareable, restorable address.
- Use browser history for in-app selection and listen for `popstate`, allowing the browser controls to restore either the list or the chosen beer.

## Changed

- Added URL/history helpers to select a beer, return to the list, and restore selection on Back or Forward.
- Updated beer-card and detail Back actions to use browser navigation state.
