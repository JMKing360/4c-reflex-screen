# House of Mastery — Inheritance Manifest (60 attributes)

The reusable, proven layer of the KOORA / 4C Finisher assessment
(`4c-reflex-screen`). Any House of Mastery property (e.g. `hom2026`,
`FINISHER-KOORA-ASSESSMENT-`) should inherit these to stay consistent in
schema, aesthetic, flow, and infrastructure.

Each item notes where it lives in this repo so it can be lifted directly.

## A. Schema & data contracts
1. **Reflex scoring model** — 4 reflexes × 4 questions, 1–4 Likert, max 16 — `index.html` `getReflexScore`.
2. **Cost sub-scale** — 10 designated questions → /40 — `getCostScore`.
3. **Start-Stop rhythm scale** — 4 questions → /16 — `getRhythmScore`.
4. **Level thresholds** — `quiet ≤0.44 · active ≤0.69 · loud` — `getLevel`. Single source of truth.
5. **Question object shape** — `{n, domain, text}` array (`QUESTIONS`).
6. **Answer/option model** — `OPTIONS[{label,score}]` + `OPT_KEYS[A–D]`.
7. **Reflex→question mapping** — `REFLEX_DATA[r].questions[]` (data-driven scoring).
8. **GHL lead payload contract** — see `lead-payload.schema.json`.
9. **Server validation contract** — `validate()` in `functions/api/ghl.js` (required name, optional valid email, length caps, 64 KB cap).
10. **Tag taxonomy** — `['assessment-koora-4c','source-cloudflare-pages','ghl-webhook']`.

## B. Content & copy system
11. **Archetype content model** — `{whatItIs, whatItActuallyIs, underneath, breaks{component,desc}, cost, strategies[], layered}` (`REFLEX_DATA`).
12. **Four "components" framework** — Integrity / Allegiance / Attention / Return.
13. **"What it looks like → what it actually is" reframe** copy structure.
14. **Cost-statement voice** — the emotional-sovereignty cost paragraph.
15. **Three-strategies model** — `{title, body}`, numbered.
16. **Layered-strategy block** — manage the other reflexes alongside the primary.
17. **Now-What FAQ block** — `NOW_WHAT.{intro, items[{q,a}]}`.
18. **Headline-by-level system** — different results H1 per loud/active/quiet.
19. **KOORA covenant voice** — "the covenant is return."
20. **Credential footer** — "Dr. Job Mogire, MD FACC · Cardiologist · Founder."

## C. Design system & aesthetic
21. **Full token palette** — `design-system/tokens.css` (`:root`).
22. **Level color trio** — green/amber/red + `-bg` tints.
23. **Dual-typeface system** — Source Serif 4 + Plus Jakarta Sans.
24. **Google Fonts query + preconnect** — `index.html` head.
25. **Uppercase eyebrow labels** — wide tracking, `--gold-ink` (contrast-safe).
26. **Progress-bar component** — fixed gold bar + ARIA progressbar.
27. **Score-bar component** — track + level-colored fill.
28. **`.startstop-row` block** — labeled secondary-metric card.
29. **Reflex-card anatomy** — dot + name + level tag → body → strategies.
30. **Underneath / breaks-block** callout styling.
31. **Brand-mark generators** — `favicon.svg` + `og-image.svg` (navy/gold SVG).
32. **Responsive breakpoint** — 600px mobile rules.

## D. Flow & interaction
33. **Slide engine** — welcome → question → results (`showSlide`).
34. **JS-driven question renderer** — single slide re-rendered (`renderQuestion`).
35. **Auto-advance** on selection with completion double-fire guard.
36. **Keyboard shortcuts** — A–D answer, Enter advance.
37. **Back/Next navigation** with answer persistence.
38. **Progress + counter sync** — bar % and "n of N" together.
39. **Focus management** — `#qText` per question, `#lockedContent` on unlock.
40. **`beforeunload` guard** — warns on mid-assessment abandonment.
41. **Retake reset logic** — full state teardown.
42. **A11y baseline** — `.visually-hidden`, `role=alert/status/progressbar`, labels, `<main>`.

## E. Conversion & lead mechanics
43. **Email-gate pattern** — scores + teaser visible, strategies/cost/downloads locked.
44. **Teaser-before-gate** — name the primary result to create pull.
45. **`unlockResults()` reveal** — `.locked → .locked.unlocked` + confirmation copy swap.
46. **Decoupled capture** — lead fires on completion (name only); email enriches.
47. **No-dead-end logic** — unlock even if email/CRM fails.
48. **Consent checkbox** + privacy link, flag forwarded to CRM.
49. **Client takeaways** — lazy jsPDF report + 1080×1080 social canvas image.
50. **Post-submit next-step CTA** — "your next step is KOORA."

## F. Infrastructure, backend & security
51. **Cloudflare Pages Function proxy** — `functions/api/ghl.js` (reusable template).
52. **Origin-restricted CORS** — configurable `ALLOWED_ORIGINS`.
53. **Optional Turnstile verify** — siteverify, dormant until keyed (set site key + secret together).
54. **Loud-failure posture** — 503 on missing webhook.
55. **Domain/redirect-as-code** — `configure-cloudflare-domains.yml` (CNAME + custom-domain + delink).
56. **`_redirects` conventions** — case-sensitivity, trailing-slash variants, short-link vs sales-page.

## G. Quality, testing & ops
57. **Buildless CI gate** — `node:test` + `html-validate` + Playwright (`ci.yml`).
58. **Deploy pipeline** — build-detect + output-dir resolve + wrangler-action.
59. **Dormant-until-keyed config** — Turnstile/GA4 no-op until env vars set.
60. **Secrets convention** — public keys may be committed; secrets stay in GH/CF env (see `CLAUDE.md`).
