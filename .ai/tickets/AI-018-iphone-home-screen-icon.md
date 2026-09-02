# AI-018 — iPhone home screen icon

## Asked
- Make the approved Habeeri bottle artwork the iPhone home screen icon.

## Decisions
- Use Apple's standard 180×180 touch-icon size.
- Keep the generated icon's opaque cream background so iOS can apply its own rounded-corner mask cleanly.
- Set the installed app title explicitly to `Habeeri`.

## Changed
- Added `public/apple-touch-icon.png` from the approved bottle artwork.
- Added Apple touch-icon and web-app-title metadata to `index.html`.
