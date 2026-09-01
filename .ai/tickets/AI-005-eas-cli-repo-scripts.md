# AI-005 — EAS CLI repo scripts

## Asked
- Update the repository scripts and docs after adding `eas-cli` as a dev dependency.

## Decisions
- Standardise on the local `eas-cli` binary via package scripts instead of `npx` or `pnpm dlx`.
- Add explicit share-oriented scripts for login, first-time project init, and publishing updates.
- Keep the publishing script generic so the release message can still be supplied at the command line.

## Changed
- Added `share:login`, `share:init`, and `share:publish` scripts to `package.json`.
- Updated `README.md` to use the new script-based workflow.
