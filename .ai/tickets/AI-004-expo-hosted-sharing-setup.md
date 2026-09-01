# AI-004 — Expo hosted sharing setup

## Asked
- Set the Expo app up so it can be shared through Expo Go without relying on a local dev server.
- Clarify the practical path for sharing a simple non-native Expo app with friends.

## Decisions
- Configure the app for modern Expo hosted updates rather than TestFlight, since the user wants a free sharing path.
- Use `runtimeVersion` based on app version so published updates stay aligned with the installed Expo Go-compatible runtime.
- Add `eas.json` so the repository is ready for EAS commands without forcing native build adoption.
- Leave the Expo project update URL as a placeholder because the actual project ID is created during the user's Expo/EAS project setup.

## Changed
- Updated `app.json` with `scheme`, `runtimeVersion`, and a placeholder `updates.url` for Expo hosted updates.
- Added `eas.json` with minimal CLI, build, and submit profiles.
- Documented the exact hosted-sharing workflow in `README.md`.
