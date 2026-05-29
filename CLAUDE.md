# Claude Code Instructions

<!-- MANUS-CLOUDFLARE-AUTOMATION:START -->

## Cloudflare Automation Context

This repository has been prepared for Cloudflare work using **repository secrets and variables**, not committed private keys. Claude Code and other automation should use the secure GitHub Actions context instead of asking for or writing API tokens into files.

| Item | Location | Notes |
| --- | --- | --- |
| Cloudflare API token | GitHub Actions secret `CLOUDFLARE_API_TOKEN` | Private. Never print, commit, or copy into source files. |
| Cloudflare account ID | GitHub Actions secret `CLOUDFLARE_ACCOUNT_ID` | Private/semi-sensitive. Use only through GitHub Actions secrets. |
| Cloudflare account email | GitHub Actions variable `CLOUDFLARE_ACCOUNT_EMAIL` | Non-secret metadata for automation. |
| Cloudflare deploy kind | GitHub Actions variable `CLOUDFLARE_DEPLOY_KIND` | Current classification: `pages`. |
| Cloudflare project name | GitHub Actions variable `CLOUDFLARE_PROJECT_NAME` | Set for this repository. |
| Cloudflare output directory | GitHub Actions variable `CLOUDFLARE_OUTPUT_DIR` | Set for this repository. |

This repository has `.github/workflows/deploy-cloudflare-pages.yml`; commits to the configured branch deploy to Cloudflare Pages automatically.

Cloudflare Pages project: `houseofmastery`. Default upload directory variable: `${{ vars.CLOUDFLARE_OUTPUT_DIR }}`.

When modifying Cloudflare deployment behavior, keep private credentials in GitHub secrets. Public client-side keys, such as a Cloudflare Turnstile **site key**, may be committed only when they are intended to be public. Turnstile **secret keys**, API tokens, webhook secrets, database URLs, and service credentials must remain in GitHub secrets or Cloudflare-managed environment variables.

<!-- MANUS-CLOUDFLARE-AUTOMATION:END -->
