# ENGAKO Metadata Rollout Playbook

Apply the same backend SEO / schema seeding done on `4c.houseofmastery.co`
(this repo, PR #18) to the other House of Mastery web surfaces:
**`mogire.com`** and **`engako.com`**.

> This session's GitHub access is scoped to `jmking360/4c-reflex-screen`, so
> the other properties must be edited in their own repos. This playbook
> reproduces exactly what #18 did so the change is portable and reviewable.

## Golden rule

**Metadata only. Do not change any visible page text, headings, navigation, or
body copy.** Every edit lives in `<head>` (meta tags + JSON-LD structured data).

## 1. Brand text — titles & descriptions

In `<title>`, `og:title`, `twitter:title`, `og:image:alt`, and any
`WebPage`/`WebSite` schema `name`, render the brand as
**`ENGAKO: The House of Mastery`** (keep the page-specific prefix, e.g.
`<Page Name> | ENGAKO: The House of Mastery`).

In `meta[name=description]`, `og:description`, `twitter:description`, and schema
`description`, replace standalone brand mentions of `House of Mastery` with
`ENGAKO: The House of Mastery` where it reads naturally. Do not rewrite the
sentence otherwise.

## 2. Keywords

Prepend to `meta[name=keywords]` (and any schema `keywords`):
`ENGAKO, ENGAKO: The House of Mastery, engako.com, ` … keep the existing terms.

## 3. Organization-identity schema nodes

For every JSON-LD node that *identifies the organization* (`Organization`,
`ProfessionalService` / `EducationalOrganization`, plus the brand `WebSite`
`name`):

- `name` → `"ENGAKO: The House of Mastery"`
- `url` → `"https://engako.com"`  *(organization nodes only — see §5)*
- `alternateName` → include `"ENGAKO"` and keep `"House of Mastery"`
- `sameAs` → add `"https://engako.com"` (once; do not duplicate)

Leave `@id` graph anchors **unchanged** so `publisher` / `founder` / `author` /
`isPartOf` cross-references keep resolving.

## 4. og:site_name

Set `og:site_name` to `ENGAKO: The House of Mastery`.

## 5. The one safety rule — indexing URLs (do NOT cross-domain canonical)

**Keep `rel=canonical`, `og:url`, every `hreflang`, and the page-level
`WebPage`/`Quiz`/`WebSite` `url` self-referencing to the page's own domain.**
Reference `engako.com` only through the Organization schema (`url` + `sameAs`).

Pointing a live page's canonical/og:url at `engako.com` tells search engines the
real version lives elsewhere and can **de-index that page** — unless `engako.com`
actually hosts an equivalent page and you are deliberately consolidating. If a
page is genuinely migrating to `engako.com`, that is a separate, intentional
decision, not part of this metadata pass.

(This is the "schema-only ref (safe)" decision the owner chose for the 4C funnel.)

## 6. Verify before shipping

- All JSON-LD blocks still parse as valid JSON.
- No `rel=canonical` / `og:url` / `hreflang` points at `engako.com` (unless an
  intentional migration).
- No new external origin is loaded (so the CSP/allowlist is unaffected).
- The rendered page body is byte-identical — only `<head>` changed.

## Reference

The canonical implementation is `4c.houseofmastery.co` (`index.html` `<head>` in
this repo) as shipped in PR #18 — copy its structure for `mogire.com` and
`engako.com`.
