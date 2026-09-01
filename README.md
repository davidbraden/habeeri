# Null Pint

A basic Expo stub for a local-only zero alcohol beer tracker.

## Features in this stub

- Inbuilt sample beer catalogue
- Per-beer rating UI
- Per-beer comment field
- No backend or sign-in
- TypeScript-based Expo setup for iOS and Android

## Run locally

1. Install dependencies:
   - `pnpm install`
   - or `npm install`
2. Start Expo:
   - `pnpm start`
   - or `npx expo start`
3. Open in an iOS simulator, Android emulator, or Expo Go.

## Share through Expo Go without your laptop running

This app is set up for Expo hosted updates, which is the free path for sharing
as long as the app stays compatible with Expo Go.

1. Create or log into your Expo account:
   - `pnpm run share:login`
2. Link the project to EAS once:
   - `pnpm run share:init`
3. Copy the generated project ID into `app.json` by replacing:
   - `https://u.expo.dev/YOUR-PROJECT-ID`
4. Publish an update:
   - `pnpm run share:publish -- --message "Initial share build"`
5. Send your friend the update link shown by EAS, or the QR code.
6. Your friend installs `Expo Go` and opens that link/QR.

Notes:

- This opens inside Expo Go, not as a standalone iPhone app.
- You do not need to keep `expo start` running after publishing an update.
- If you add packages that require custom native code later, this sharing path may stop working.

## Good next steps

- Persist ratings/comments with `AsyncStorage`
- Add a form to create your own beers
- Add filters for brewery, style, and rating
- Split into tabs like `All beers`, `Tried`, and `Favourites`
