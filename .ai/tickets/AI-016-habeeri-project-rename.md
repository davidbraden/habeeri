# AI-016 — Habeeri project rename

## Asked

- Rename all project branding and identifiers to Habeeri / `habeeri`.

## Decisions

- Updated user-facing branding, package metadata, and deployment examples consistently.
- Changed the browser storage namespace while retaining a one-time migration for existing saved beer logs.

## Changed

- Renamed the app heading and HTML document title to Habeeri.
- Renamed the package and Cloudflare Pages example project to `habeeri`.
- Added migration-compatible loading and cleanup of the former browser storage key.
