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

## Security Headers (`_headers`)

`_headers` ships Cloudflare Pages security headers for the live funnel. The
rollout follows the durable path for a revenue page:

- **Enforced now** (cannot break conversions): HSTS, `nosniff`, `Referrer-Policy`,
  `Permissions-Policy`, COOP, and the CSP directives `object-src 'none'`,
  `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'self' https://*.houseofmastery.co`.
- **Report-Only** (validating before enforcing): the full resource allowlist
  (`script/style/font/img/connect/frame-src`). Every allowed origin maps to a
  real dependency in `index.html` / `functions/api/ghl.js` (EmailJS, jsPDF,
  Turnstile, GA4, Google Fonts). `test/infra.test.js` keeps the allowlist in
  lockstep with the code and will fail CI if a new external origin is added
  without being allowed.
- **To promote to enforcing:** once Report-Only shows no legitimate violations
  in production, merge the Report-Only allowlist into `Content-Security-Policy`
  and delete the Report-Only header.

Do not add a restrictive `default-src` to the *enforced* policy — it would block
the external scripts/styles/fonts the app legitimately loads. Keep inline-script
allowances (`'unsafe-inline'`) in the Report-Only policy only.

## Finisher Alignment — Deferred Roadmap

`4c-reflex-screen` is aligned to the canonical KOORA Finisher design system
(palette, copy standards, security headers, PWA). The following Finisher
capabilities are intentionally **not** adopted yet, each for a durability reason:

- **Resend email / Meta CAPI + Pixel** — require secrets (provider API keys,
  Meta tokens) and change a live funnel's runtime. Wire only with keys in GitHub
  secrets and after validating delivery; do not rip out working EmailJS blind.
- **Vite build** — converting the zero-build single-file app to a bundler trades
  a working artifact for build fragility; not clearly more durable here.
- **Six-covenants / ALCARRA instrument** — a product decision about what the
  assessment measures. Requires explicit sign-off; not an engineering call.

## Review & Merge Policy

Standing order: when work is reviewed by the Integration Director across **two
review passes** and both passes **approve** (no merge-blockers), proceed to
**merge the pull request autonomously** — no separate manual confirmation is
required from the user.

Conditions that must hold before an autonomous merge:
- The change was developed on a feature branch with an open pull request
  (never push directly to `main`).
- Both Director review passes returned APPROVE with no outstanding
  merge-blocking findings.
- CI is green on the head commit (unit tests, html-validate, and the
  Playwright end-to-end smoke test).

If any of these is not met, do not merge — report status and wait for input.
