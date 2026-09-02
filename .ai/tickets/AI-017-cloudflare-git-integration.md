# AI-017 — Cloudflare Git integration

## Asked

- Remove the GitHub Actions deployment workflow and use Cloudflare's GitHub integration instead.

## Decisions

- Let Cloudflare Pages build the Vite site directly from GitHub, avoiding repository deployment secrets and a duplicate CI deployment path.
- Keep `main` as the production branch and `dist` as the static build output.

## Changed

- Removed `.github/workflows/deploy-pages.yml`.
- Replaced the Direct Upload and GitHub Actions instructions in `README.md` with the Cloudflare Git integration settings.
