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

The GitHub Actions workflow in `.github/workflows/deploy-pages.yml` type-checks
and builds every pull request into `dist`. A push to `main`, or a manually
dispatched run, also uploads `dist` to a Cloudflare Pages Direct Upload project.

One-time setup:

1. Create a Pages project with `main` as its production branch. With Wrangler:
   - `npx wrangler@4 login`
   - `npx wrangler@4 pages project create habeeri --production-branch main`
2. In Cloudflare, create a custom API token with `Account > Cloudflare Pages >
   Edit` permission, restricted to the account that owns the Pages project.
3. In the GitHub repository, open **Settings > Secrets and variables > Actions**
   and add these repository secrets:
   - `CLOUDFLARE_ACCOUNT_ID`: the account ID shown in Cloudflare's account
     overview.
   - `CLOUDFLARE_API_TOKEN`: the token created in the previous step.
4. On the **Variables** tab in the same GitHub screen, add
   `CLOUDFLARE_PAGES_PROJECT_NAME` with the project name (`habeeri` in the
   example above).
5. Push to `main`, then follow the deployment URL in the workflow summary.

To use a custom domain, open the Pages project in Cloudflare, select **Custom
domains > Set up a custom domain**, and follow the DNS prompts. No repository
change is required.

## Good next steps

- Add a form to create your own beers
- Add filters for brewery, style, and rating
- Add route-based pages like `Catalogue`, `Tried`, and `Favourites`
