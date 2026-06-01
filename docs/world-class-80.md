# The 4C Assessment — 80 World-Class Attributes (and the Fast 40)

**Brief to the panel:** *Design this as a premium self-assessment Apple is about to
acquire. It must feel truly world-class across every aspect.* Four specialists
contributed (visual+motion, UX+copy, psychometrics+accessibility,
engineering+trust+growth); this is the director's synthesis.

**Effort** = build cost in our single-file, zero-build app (Quick ≈ <30 min CSS/markup ·
Med ≈ hours · Big ≈ substantial). **Impact** = on perceived premium quality / trust /
completion. ★ = selected for the **Fast 40**.

---

## A. Visual & brand identity
1. ★ Dynamic `theme-color` per screen (white → ink → gold) so the OS chrome is art-directed. [Quick/High]
2. ★ Inline gold "4C" SVG favicon as a `data:` URI — no generic tab globe, no request. [Quick/Med]
3. PWA maskable icon + splash + `display:standalone` (home-screen app indistinguishable from native). [Med/High]
4. ★ `font-variant-numeric: tabular-nums` on every score/number. [Quick/Med]
5. ★ Name field as a single ink underline (no input box), name typed in large display weight. [Quick/High]
6. ★ Dark "practice" card material depth (gold left border, inset top highlight, soft lift shadow). [Quick/High]
7. ★ Gold hairlines flanking the growth pull-quote, animating in from center. [Quick/High]
8. Chapter openers as full-bleed cinematic ink moments (reflex name large, one-line definition). [Med/High]
9. Frequency-glyph answer options (inline SVG dot-density: sparse→dense). [Med/High]
10. ★ Precise fallback stack (`-apple-system`/SF) so pre-load renders native, never Times. [Quick/Med]

## B. Motion & micro-interaction
11. ★ Spring easing on the progress bar (slight overshoot+settle); shifts gray→gold by the final chapter. [Quick/High]
12. ★ Elastic CTA press (`scale .96` spring-back) — quality felt before question one. [Quick/High]
13. Answer ink-fill bloom from the tap point. [Med/High]
14. ★ "Calculating" as one breathing gold orb (sine scale+opacity), not a spinner. [Quick/High]
15. Staggered results entry (translateY+fade, 60 ms stagger). [Med/High]
16. Directional slide transitions (next from right, previous from left). [Med/Med]
17. ★ `requestAnimationFrame`-gated auto-advance — kills the "stuck tap" jank on low-end Android. [Quick/High]
18. ★ Optional answer-tap haptic (`navigator.vibrate(8)`) — native-instrument feel. [Quick/Med]
19. ★ Stem "In the past 30 days" stays fixed and dims while the question slides in. [Quick/Med]
20. ★ `prefers-reduced-motion`: instant transitions everywhere. [Quick/Med]

## C. Question / assessment UX
21. ★ Scroll-lock the body during questions (no accidental scroll-away). [Quick/Med]
22. `overscroll-behavior:none` + scroll-snap per screen (no pull-to-refresh kill). [Med/High]
23. 2-second "Undo last answer" toast after auto-advance (autonomy without rumination). [Med/Med]
24. ★ Inline behavioral labels on the scale ("Several times" + a faint descriptor), not bare options. [Quick/High]
25. ★ Visually mark the 2 non-scored items + a "a little context" label (instrument transparency). [Quick/Med]
26. ★ `inputmode`/`autocomplete` on fields + 16 px to stop iOS zoom-on-focus. [Quick/Med]
27. "Calculating" shows the first name + the four reflexes assembling. [Med/High]
28. Lightweight consent line up front (what it measures / isn't a diagnosis). [Quick/High] ★
29. ★ "Think of a specific week" recall anchor in the stem (reduces telescoping error). [Quick/Med]
30. ★ Enforce 44×44 tap targets + spacing on options (no fat-finger miss-scores). [Quick/Med]

## D. Copy & voice
31. Items rewritten as first-person inner monologue (self-recognition, not interrogation). [Med/High]
32. ★ Name personalization woven through openers, gate, and results header. [Quick/High]
33. ★ Cover P2 ends on a permission line ("no right answers, only an honest picture"). [Quick/High]
34. ★ Gate framed as concierge value-exchange ("we'll send it and hold it for you"). [Quick/High]
35. ★ Chapter-opener reframes that de-shame each reflex before answering. [Quick/High]
36. ★ Warm, coach-like field validation ("double-check that — we want it to reach you"). [Quick/Med]
37. ★ "Find a quiet minute" calm-container line on the cover. [Quick/Med]
38. CTA tied to the dominant reflex ("Your 10-day Competing reset"). [Med/High]

## E. Results report & shareability
39. Named profile archetype headline ("The Benchmarker", "The Ruminator"). [Big/High]
40. Personalized growth sentence that names the dominant reflex in a vivid line. [Med/High]
41. 4×4 reflex×domain mini-heatmap (construct precision; reduces global mislabeling). [Med/High]
42. Dark card opens with pattern-recognition (diagnosis before prescription). [Med/High]
43. Profile-card Canvas: dark-glass base, gold arc scores, gallery-grade. [Big/High]
44. Profile-card export at 9:16 for Stories, with wordmark. [Med/High]
45. Web Share API with PNG blob; download fallback. [Med/High]
46. ★ Premium static OG/social card (redesign `og-image.svg`). [Quick/High]
47. "Challenge a friend" in-product share CTA. [Med/High]

## F. Psychometric rigor & honesty
48. Reverse-scored items + straight-line/agreement-bias detection. [Med/High]
49. One instructed-response attention item, scored silently. [Med/High]
50. ★ "Your top two reflexes are nearly tied" when scores are within ~3 (no false precision). [Quick/High]
51. Intra-scale consistency soft prompt for contradictory answers. [Med/High]
52. Domain-specific (not global) scoring narrative. [Med/High]
53. Return-band norms from a small Kenyan pilot (publish n + date). [Big/High]
54. ★ Collapsible "How your score was calculated" transparency block. [Quick/High]
55. Test-retest at 10 days with a side-by-side delta + "±3 is normal day-to-day" note. [Med/High]
56. ★ Uncertainty/range language in the results (honest, not absolute). [Quick/Med]

## G. Trust, privacy & safety
57. ★ Privacy microcopy at the gate ("only to send your results · never sold · unsubscribe anytime"). [Quick/High]
58. ★ Factual security cue ("Encrypted · Cloudflare") at the gate. [Quick/Med]
59. Tiered distress routing incl. a Kenya crisis line (Befrienders) above results when wellbeing is high. [Med/High]
60. ★ Plain-language consent on data use (who holds it, how it's used). [Quick/High]
61. Network retry + `localStorage` queue for `/api/ghl` (never silently drop a lead). [Med/High]
62. Promote CSP from Report-Only to enforced once clean. [Med/Med]
63. ★ Data-minimization + an explicit "clear my data" control on shared devices. [Quick/Med]

## H. Accessibility & inclusivity
64. Full keyboard navigation + visible focus ring (≥2 px, offset). [Med/High]
65. Screen-reader matrix: `fieldset`/`legend` + full `aria-label`s (not "radio 2 of 4"). [Med/High]
66. WCAG AA contrast audit on every color pair. [Med/Med]
67. Text-spacing toggle (WCAG 1.4.12 params), persisted. [Med/Med]
68. English / Swahili language toggle (`lang` swap, inlined JSON). [Big/High]
69. Cross-cultural item audit (East-Africa) + translator credit. [Big/High]
70. `prefers-color-scheme: dark` variant holding the same contrast ratios. [Med/Med]
71. Low-bandwidth / 2G resilience (resume mid-assessment). [Med/High]

## I. Performance & engineering craft
72. ★ Predictive WOFF2 font preload (kills FOUT). [Quick/High]
73. ★ `local()`-first `@font-face` (installed copy skips the network). [Quick/Med]
74. ★ Non-render-blocking font load (`media=print` onload swap). [Quick/High]
75. `localStorage` autosave + "Resume where you left off?" banner. [Med/High]
76. Service-worker offline shell cache (full airplane-mode run). [Med/High]
77. ★ `@media print` → clean one-page PDF of the results. [Quick/Med]

## J. Growth, lifecycle & PWA
78. Defer the "Add to Home Screen" prompt to the results screen (user is invested). [Med/Med]
79. Return-user "Welcome back, [Name]" state (saved results, prevents duplicate leads). [Med/High]
80. 10-day-challenge deep-link rehydration via query params (lead → activation loop). [Big/High]

---

## The Fast 40 — recommended first wave
Quick to build, low risk (mostly CSS / copy / `<head>` / small JS), no scoring or
flow re-architecture, and the biggest jump in perceived premium + trust:

**Performance (4):** 17 rAF auto-advance · 72 font preload · 73 local()-first font · 74 non-blocking font load.
**Visual polish (8):** 1 per-screen theme-color · 2 gold SVG favicon · 4 tabular numerals · 5 ink-underline name field · 6 practice-card depth · 7 growth hairlines · 10 SF fallback stack · 25 mark non-scored items.
**Motion (6):** 11 spring progress (gold finish) · 12 elastic CTA · 14 breathing-orb calculating · 18 tap haptic · 19 fixed/dimmed stem · 20 reduced-motion.
**Question UX (5):** 21 scroll-lock · 24 inline scale labels · 26 inputmode/16px · 29 recall anchor · 30 44px tap targets.
**Copy (7):** 32 name personalization · 33 cover permission line · 34 concierge gate · 35 de-shame openers · 36 warm validation · 37 "quiet minute" · 28/60 consent line.
**Trust (4):** 57 gate privacy microcopy · 58 security cue · 63 clear-my-data · 56 uncertainty language.
**Results & rigor (6):** 46 premium OG card · 50 "top two nearly tied" · 54 "how it's scored" block · 77 print stylesheet · 40-lite vivid growth line · 42-lite one diagnosis sentence on the dark card.

## Phase 2 — bigger bets (high impact, more effort/decisions)
Archetype naming (39) · reflex×domain heatmap (41) · gallery-grade Canvas card + 9:16 + Web Share (43–45) · reverse-scored & attention items + consistency (48,49,51) · 10-day test-retest (55) · tiered crisis routing (59) · keyboard + screen-reader + contrast a11y pass (64–66) · Swahili + cultural audit (68,69) · autosave + service worker + offline (75,76,71) · return-user state (79) · challenge deep-link (80) · norming pilot (53).

> Items that touch the **instrument** (items, scoring, scale) or the **flow** need your
> sign-off before build, per the project's instrument-change rule.
