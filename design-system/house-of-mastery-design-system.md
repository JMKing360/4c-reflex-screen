# House of Mastery — Brand & Web Design System
**Version 1.1 · June 2026 · Canonical**

Single source of truth for every House of Mastery web surface: marketing pages, the platform, books and imprints, and all assessments and inventories. The companion file `house-of-mastery.css` holds the tokens and components. The logo files are supplied as assets (see Section 5). Build against all three. If a value, color, font, or pattern is not in this system, it is not approved.

The system holds authority and warmth in the same breath. Premium is shown through restraint, space, weight, and depth, never decoration. When in doubt, remove.

**What changed in v1.1.** Color is aligned to the real logo. The logo is one-color only: navy on light grounds, white on dark. Cyan is reserved and never used in product. Brass remains the single accent. Type weight was raised for impact: heavier display serif, heavier and tighter navigation and labels, deeper navy.

---

## 1. Agent Operating Directives

Paste this block into any agent building a House of Mastery surface. Non-negotiable.

1. **Use only system tokens.** Colors, fonts, spacing, radii, shadows come from `house-of-mastery.css`. Never invent a hex, font, or radius.
2. **Logo is the supplied asset, one-color only.** Navy logo on light grounds, white logo on dark grounds. Never the cyan version. Never recolor, restyle, or rebuild the mark. The hm monogram is a knockout; the ground shows through it.
3. **Cyan is reserved.** It exists in the source logo but is never used in product, type, UI, or backgrounds until a formal rebrand.
4. **Brass is the only accent.** At or under 1 to 2 percent of any surface. Never a fill, never a background, never body text. It is the seal of mastery: one rule, one focus state, one premium underline.
5. **Navy is primary and deep.** Large grounds use the deep navy and ink. Depth carries the authority.
6. **Two typefaces.** Cormorant Garamond (serif) for headlines, statements, editorial voice, large assessment questions, large numbers. Jost (sans) for nav, labels, eyebrows, body, UI, and bold kickers.
7. **Headlines are heavy.** Display serif at 600, hero at 700, with tight tracking so headlines read as a solid block.
8. **Nav and labels are heavy and present.** Jost 600, tighter tracking, bright on navy. Never thin or airy.
9. **Corners are square.** Radius 0 everywhere. Circles only for the icon mark and avatars.
10. **Flat UI casts no shadow.** Elevation is hairline borders and surface color. Shadows are for physical-object renders only.
11. **Space is the design.** Generous padding, wide section rhythm, body never below 15px or narrower than 60 characters. Hierarchy from scale, weight, and space.
12. **Voice is a master to a peer.** Plain, calm, certain. No hype, no urgency, no jargon, no exclamation, no em-dash pauses.
13. **Run the compliance checklist (Section 13) before shipping.**

---

## 2. Foundations: Design Tokens

All tokens live in `:root` in `house-of-mastery.css`. Reference by variable; never hardcode.

**Color:** `--ink --navy --navy-soft --navy-line --brass --brass-deep --brass-soft --ivory --cloud --mist --stone --paper-cool --body-ink`. Reserved: `--reserved-cyan` (do not use).

**Type:** `--serif --sans`.

**Space:** `--s-1`..`--s-8`, `--space-section`, `--space-section-tight`.

**Layout:** `--maxw` (1180), `--maxw-text` (60ch), `--gut`.

**Radius:** `--radius` (0), `--radius-pill` (circles only).

**Lines:** `--line-on-light`, `--line-on-light-soft`, `--line-on-navy`.

**Elevation:** `--shadow-object` (physical mockups only).

**Motion:** `--ease`, `--dur`.

---

## 3. Color System

| Token | Hex | Role |
|---|---|---|
| Ink | `#060E26` | Deepest grounds, hero base, depth |
| Navy (primary) | `#0B1538` | The brand. Primary surfaces and type. Matches the logo navy |
| Field Navy | `#18233F` | Panels, secondary navy surfaces |
| Navy Line | `#2A3759` | Hairlines on navy |
| Antique Brass | `#C3A35E` | The single accent. The seal of mastery. Sparing |
| Brass Deep | `#A2823F` | Eyebrows and labels on light |
| Brass Soft | `#DCC79A` | Brass type and rules on navy |
| Ivory | `#F3EFE6` | Warm paper. Default light ground |
| Paper Cool | `#EDF1F8` | Primary text on navy |
| Mist | `#C4CCDD` | Secondary text on navy |
| Stone | `#8C8676` | Captions and metadata on light |
| Body Ink | `#3A4564` | Body copy on light |
| Reserved Cyan | `#0096D5` | Logo source color. NOT used in product |

**Ratio rule.** Navy and ivory do the work. Brass is the seal, used at 1 to 2 percent of any surface. The moment brass reads as decoration, it is wrong.

**Cyan.** The logo's source cyan is retired from product. Do not use it for type, UI, links, accents, or backgrounds. It returns only with a formal rebrand.

**Accessibility.**
- Body: navy on ivory, or paper-cool on navy. Both pass comfortably.
- Mist on navy is for secondary or larger text only.
- Brass and brass-soft are for display type, rules, and accents only. Never body text.
- Stone is metadata and captions on light only.
- Every interactive element carries a visible focus ring: navy on light, paper-cool on navy.

---

## 4. Typography

**A serif that thinks, a sans that signs. Both carry more weight now.**

- **Cormorant Garamond** (`--serif`; 400 / 500 / 600 / 700 + italics). Headlines, statements, editorial voice, large assessment questions, large numbers. Set headlines at 600, hero at 700, with tight tracking. Calm authority with real presence.
- **Jost** (`--sans`; 300 / 400 / 500 / 600 / 700). Nav, eyebrows, labels, body, UI, buttons, and bold kickers. Nav and labels at 600 with tighter tracking so they read as confident, not airy.

**Scale (classes):** `.h-xl .h-lg .h-md` (display headings, 600, tight); `.display--max` (700, hero only); `.statement` (large editorial, 500); `.lead` (intro, 500); `.body` (running copy, 400); `.eyebrow` (tracked labels, 600); `.kicker` and `.stat-num` (bold geometric, for indices, stats, impact); `.headline-sans` (optional sans headline for high-impact moments, used sparingly).

**Rules.**
- Headlines heavy and tight. Tracking goes slightly negative as size grows.
- Eyebrows and labels: Jost 600, uppercase, tracked, brass-deep on light.
- Body never tighter than 60ch, never below 15px, leading near 1.7. Body stays regular weight; do not bolden running text.
- One italic brass word per statement, maximum. Italic carries emphasis, color seals it.
- The `.kicker` and `.stat-num` styles echo the logo's bold geometric wordmark. Use them for numbers and structural labels, not for sentences.

---

## 5. Logo

**Use the supplied asset. Do not rebuild, recolor, or add a monogram.** The mark is the cyan circle with the hm house-monogram and the lowercase wordmark. In product it is rendered one-color.

**Approved files.**
- `hm-logo-navy.png` — full lockup, navy, transparent. For light grounds (ivory, white).
- `hm-logo-white.png` — full lockup, white, transparent. For dark grounds (navy, ink, photography).
- `hm-mark-navy.png` / `hm-mark-white.png` — icon-only circle mark. For favicons, avatars, app icons, tight spaces.

**Rendering rule.** One color only. Navy on light, white on dark. Never the cyan version anywhere in product. The hm monogram is a knockout: the background shows through the letters, so place the logo on a clean ground, never a busy image without a scrim.

**Placement (classes):** `.brand-logo--nav` in the topbar (white on the navy bar), `.brand-logo--hero` for hero lockups, `.brand-mark--avatar` for the icon.

**Clear space.** Keep space on all sides equal to the height of the circle mark. Nothing enters that field.

**Minimum size.** Full lockup no smaller than 120px wide on screen. Below that, use the icon-only mark.

**Misuse (never).** Do not use the cyan version in product. Do not recolor to any other hue. Do not add the old seal or any new monogram. Do not stretch, rotate, outline, or shadow the mark. Do not place the knockout monogram on a busy photo without a solid scrim. Do not reconstruct the logo in live text.

**Typographic fallback.** When the asset genuinely cannot be used, the `.lockup` component sets HOUSE OF over a rule over MASTERY in Jost 600. This is a fallback, not the logo.

---

## 6. Layout and Spacing

- Page max width 1180px, centered, fluid gutter.
- Vertical rhythm: `.section` standard, `.section--tight` for closes and transitions.
- Grids `.cols-2 .cols-3 .cols-4`, collapsing under 820px.
- Dividers: `.divline` (thin, secondary) between ideas; `.divline--strong` (2px navy) for load-bearing breaks. Use the strong rule rarely, where structure must register.
- Alternate light and navy bands to pace a page. Navy bands carry the most important claims.

---

## 7. Components

Defined in `house-of-mastery.css`.

- **Surfaces:** `.panel-navy` (deep radial navy, the authority ground), `.card`, `.card--ivory`.
- **Eyebrows:** `.eyebrow` (now 600 weight, 1.5px brass mark) with `--center --light --plain`.
- **Buttons:** `.btn--primary` (solid navy, heavier, larger), `.btn--secondary` (hairline outline), `.btn--quiet` (text with a 2px brass underline drawing on hover, the single highest-value CTA per view). Brass is never a button fill.
- **Links:** `.link` (1.5px brass underline at rest, navy on hover).
- **Topbar:** `.topbar` transparent over hero, `.solid` on scroll; nav links Jost 600, bright, tighter.
- **Footer:** `.foot`.
- **Impact type:** `.kicker`, `.stat-num`, `.headline-sans` for structural emphasis.

**Elevation discipline.** Cards and panels separate by hairline and surface color, not shadow. Shadows live only on physical-object renders.

---

## 8. Assessments and Instruments

Every inventory, diagnostic, and Likert instrument uses one pattern so they read as one house.

- **Container:** `.assess`, max 760px, centered. One question per view.
- **Progress:** `.assess__progress`, brass fill on a mist track. Thin, quiet, always visible.
- **Section label:** `.assess__section`, Jost 600 tracked brass-deep caps.
- **Question:** `.assess__q`, Cormorant 600, large and calm.
- **Options / Likert:** `.opt` rows, hairline, square, selectable. Selected fills ivory with a navy border and a brass dot. Selection-only; no free text inside a scale.
- **Result:** `.result` on a `.panel-navy` ground. `.result__score` is a large brass-soft serif number (700); `.result__band` the tracked label beneath. State the finding plainly, then the path.

This is the visual contract for the entire assessment layer. On navy grounds the selected and progress accents flip to paper-cool where contrast requires.

---

## 9. Imagery and Texture

- **Portraits** on a deep navy ground, generous negative space, subject to one side, the white logo small in a corner inside its clear space. Warm, neutral grading. Calm, never busy.
- **Texture:** optional, near-invisible `.grain` on navy heroes only.
- No stock clutter, no gradients beyond the navy panel gradient, no glow, no gloss.

---

## 10. Voice and Tone

We speak the way a master speaks to a peer.

**We do.** Speak plainly and with conviction. Name the gap between looking successful and feeling it. Honor the reader's achievement before challenging it. Let silence work.

**We don't.** Hype, hustle, or manufacture urgency. Shame, diagnose, or talk down. Crowd the page with jargon, statistics, or exclamation.

**Punctuation.** Favor the period and the colon. Avoid the em-dash as a dramatic pause.

**In a sentence:** "You have arrived at every door but one. We keep that one."

**Example copy (calibrated, reusable):**
- Hero: *The standard of arrival. For those who have succeeded by every external measure, and now seek the mastery within.*
- Positioning: *For the one who looked like success, and is ready to become it.*
- Close: *The house keeps the standard, so the standard can keep its people.*

---

## 11. Brand Personality

Six traits, held in balance. No single trait dominates.

1. **Premium and Excellent** — quality through restraint and space.
2. **Calm** — an unhurried voice; stillness for loud lives.
3. **Authority** — mastery, not credentials; willing to name hard truths.
4. **Welcoming** — premium without coldness; the door held open.
5. **Trustworthy** — consistency is the proof.
6. **Impactful** — quiet force; weight and clarity, not volume.

---

## 12. Page Archetypes

- **Hero:** full-height `.panel-navy`, white logo lockup at confident scale, a heavy serif headline (700), one `.lead` line, scroll cue. Optional `.grain`.
- **Content section:** light ground, `.eyebrow` then heavy `.display` headline then `.body`, generous space.
- **Statement band:** `.panel-navy`, centered `.statement` with one brass italic word. The page's most important claim.
- **Assessment view:** Section 8.
- **Application / mockup:** physical objects on neutral grounds with `--shadow-object`. The only place shadows appear.

---

## 13. Compliance Checklist

Run before shipping any House of Mastery surface.

- [ ] Only system tokens. No stray hex, font, radius, or shadow.
- [ ] Logo is the supplied asset, one-color: navy on light, white on dark. No cyan. Not rebuilt or recolored.
- [ ] Cyan appears nowhere in product.
- [ ] Brass at or under 1 to 2 percent. Never a fill or body text.
- [ ] Cormorant for display, Jost for everything else. No third typeface.
- [ ] Headlines heavy (600, hero 700), tracking tight at scale.
- [ ] Nav and labels Jost 600, bright and present, not thin.
- [ ] All corners square. Circles only on the icon mark and avatars.
- [ ] No shadows on flat UI. Shadows only on physical-object renders.
- [ ] Body at 60ch or wider, 15px or larger, leading near 1.7, regular weight.
- [ ] Logo has full clear space; minimum sizes respected.
- [ ] Visible focus ring on every interactive element (navy on light, paper-cool on navy).
- [ ] `prefers-reduced-motion` respected. Motion slow, opacity and small translate only.
- [ ] Assessments use the Section 8 pattern exactly.
- [ ] Copy reads as a master to a peer. No hype, no exclamation, no em-dash pauses.

---

*House of Mastery · Brand & Web Design System · v1.1 · 2026. This file, `house-of-mastery.css`, and the logo assets move together. Version them together.*
