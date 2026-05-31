# House of Mastery — Shared Design System

A reuse bundle for House of Mastery properties. The **canonical brand standard**
is the `koora-design-system.css` in the `FINISHER-KOORA-ASSESSMENT-` repository
(navy `#163558`, gold `#9E7340`, warm blue-grey paper, no black). `tokens.css`
here mirrors that canonical palette; `4c-reflex-screen` has been aligned to it.
Other properties (`hom2026`, future assessments) should inherit from the same
source so the ecosystem stays visually unified.

Copy conventions inherited from the Finisher standard: **no em-dashes in
user-facing copy** (use a comma, semicolon, or " - "), and the author credential
is **Dr. Job Mogire, MD, FACP, FACC**.

## Contents

| File | What it is | How to use it |
| --- | --- | --- |
| `INHERITANCE.md` | The 60-attribute manifest — every reusable element, with its location in this repo. | Read first. Use as the checklist when aligning another property. |
| `tokens.css` | Brand color/type tokens + the quiet/active/loud level language + a11y/level utilities. Extracted verbatim from `index.html`. | `<link>` it (or paste the `:root` block) so every property shares one palette. |
| `lead-payload.schema.json` | JSON Schema for the canonical assessment → CRM payload. | Validate any assessment's lead payload against this so one HighLevel workflow ingests them all. |
| `assessment-webhook.template.js` | Generalized Cloudflare Pages Function (`/api/ghl`): origin-locked CORS, 64 KB cap, payload validation, optional Turnstile verify, loud-failure 503. | Copy to `functions/api/ghl.js` in a new property; edit `DEFAULT_ALLOWED_ORIGINS`; set env vars. |

## Principles carried across properties

- **One level language.** quiet (green) / active (amber) / loud (red), thresholds
  `≤0.44 / ≤0.69 / else`. Don't redefine per property.
- **Decoupled capture, no dead ends.** Capture the completed assessment on
  results (name only); enrich with email later; always reveal content even if
  email/CRM fails.
- **Dormant-until-keyed.** Turnstile and GA4 are no-ops until their env vars /
  keys are set, so a property is always shippable. Enable Turnstile's site key
  and secret together.
- **Secrets discipline.** Public keys (EmailJS public key, Turnstile site key)
  may be committed; tokens, webhook URLs, and Turnstile secrets stay in
  GitHub/Cloudflare env. See the root `CLAUDE.md`.
- **Buildless quality gate.** `node:test` units + `html-validate` + Playwright
  smoke test gate every change before deploy.

## Scope note

These files are documentation/templates and are not wired into the live app
build; the running assessment remains `index.html` + `functions/api/ghl.js`.
The deploy excludes nothing here, but nothing here changes runtime behavior.
