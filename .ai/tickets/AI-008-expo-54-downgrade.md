# AI-008 — Expo 54 downgrade

## Asked
- Downgrade the app from Expo SDK 57 to Expo SDK 54.
- Fix follow-on local startup and publish issues so the Expo 54 setup works cleanly.

## Decisions
- Updated core Expo packages to the SDK 54-compatible versions resolved by `pnpm install`.
- Downgraded `react`, `react-native`, and `@types/react` to the Expo 54-compatible versions, then aligned `react-native` to the expected patch release (`0.81.5`).
- Removed `expo-status-bar` from Expo config plugins because it is a runtime package, not a config plugin.
- Updated the publish script to use the project-local `eas` binary for a deterministic CLI path.

## Changed
- Updated Expo and React Native dependency ranges in `package.json`.
- Changed `share:publish` in `package.json` to `./node_modules/.bin/eas update --branch production`.
- Removed the invalid `plugins` entry from `app.json`.
- Removed the same invalid `plugins` entry from `app.config.js`.
- Refreshed `pnpm-lock.yaml` and `node_modules` for the corrected Expo 54 dependency graph.
