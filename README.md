# Habeeri

A browser-based zero alcohol beer tracker.

## Features

- Inbuilt sample beer catalogue
- Per-beer rating UI
- Per-beer comment field
- No backend or sign-in
- Browser-first React + Vite setup
- Local browser storage for ratings, notes, and tried dates

## Run locally

1. Install dependencies:
   - `pnpm install`
   - or `npm install`
2. Start the web app:
   - `pnpm dev`
   - or `npm run dev`
3. Open the local URL Vite prints in your browser.
4. Build a production bundle with `pnpm build`.

## Deploy to Cloudflare Pages

Cloudflare Pages builds and deploys the site through its GitHub integration. No
GitHub Actions workflow or Cloudflare API token is required.

One-time setup:

1. Push the repository to GitHub.
2. In Cloudflare, open **Workers & Pages > Create application > Pages > Connect
   to Git** and authorize access to the GitHub repository.
3. Configure the project with:
   - Production branch: `main`
   - Framework preset: `Vite`
   - Build command: `pnpm build`
   - Build output directory: `dist`
   - Root directory: `/`
4. Select **Save and Deploy**. Later pushes to `main` create production
   deployments, while pull requests receive preview deployments.

To use a custom domain, open the Pages project in Cloudflare, select **Custom
domains > Set up a custom domain**, and follow the DNS prompts. No repository
change is required.

## Good next steps

- Add a form to create your own beers
- Add filters for brewery, style, and rating
- Add route-based pages like `Catalogue`, `Tried`, and `Favourites`
