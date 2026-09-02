# AI-015 — Cloudflare Pages deployment

## Asked
- Set up GitHub Actions to build the site and publish it to Cloudflare Pages as a static site.
- Explain the one-time Cloudflare setup needed for deployment.

## Decisions
- Use a Cloudflare Pages Direct Upload project so GitHub Actions owns the build and deployment process.
- Validate pull requests with type-check and build steps, but only deploy pushes to `main` and manual workflow runs so deployment credentials are not exposed to pull requests.
- Store Cloudflare credentials as GitHub secrets and the reusable Pages project name as a GitHub repository variable.

## Changed
- Added `.github/workflows/deploy-pages.yml` to install locked dependencies, type-check, build `dist`, and deploy it with Wrangler.
- Documented Pages project creation, scoped API-token permissions, GitHub Actions configuration, deployment behaviour, and optional custom-domain setup in `README.md`.
