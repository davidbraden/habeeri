# AI-006 — Expo SDK 57 upgrade

## Asked
- Update Expo and related dependencies to the latest versions.

## Decisions
- Used `expo install` so React, React Native, Expo modules, and typings align to the current Expo SDK compatibility map.
- Kept the upgrade focused on Expo-related packages and lockfile changes only.
- Preserved existing app config, accepting the CLI-added `expo-status-bar` plugin entry.

## Changed
- Updated Expo from SDK 51 to SDK 57 in `package.json`.
- Updated related packages: `expo-status-bar`, `expo-updates`, `react`, `react-native`, and `@types/react`.
- Refreshed `pnpm-lock.yaml` to capture the resolved dependency graph.
- Updated `app.json` with the plugin entry added by the Expo CLI.
- Verified the project with `pnpm run typecheck` and `npx expo install --check`.
