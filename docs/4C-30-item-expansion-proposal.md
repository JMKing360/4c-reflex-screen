# The 4C Personal Task Assessment — 30-Item Expansion (Design Proposal)

**Status:** ✅ Approved by the owner and **implemented** (the live assessment is
now the 30-item version described here). This document remains the design record.
The validation steps in §6 (real psychometrician + clinician review, pilot) are
still recommended before any "validated/measures" language is used publicly.

**Context:** KOORA, week one of each month — **the 4Cs: the emotional reflexes
of escape** (Complaining, Criticizing, Comparing, Competing). The assessment's
job is not to label people. It is to help a person *catch the leak sooner* and
leave with one honest, doable practice.

---

## ⚠️ Honesty note on "10 specialists"

I cannot recruit real credentialed professionals. What follows is **synthesized
from ten specialist lenses** — a structured way to pressure-test the instrument
from ten angles. For a tool carrying **Dr. Job Mogire, MD, FACP, FACC**'s name,
treat this as a *strong internal draft*, then have **at least one real
psychometrician and one licensed mental-health clinician** review it before any
language that implies measurement validity or clinical insight. Recommended
real-world validation steps are in §6.

---

## 1. The ten lenses (and what each demanded)

| # | Lens | What it changed in this design |
|---|------|--------------------------------|
| 1 | **Psychometrician / measurement** | The current Return score rests on only 4 items (low reliability). Expand to 8. Add one "signature" item per C to stabilize the dominant-C estimate. Keep a balanced 0–3 frequency scale. |
| 2 | **Clinical psychologist (CBT)** | Think→Feel→Choose→Do is essentially the cognitive-behavioral chain; keep the 4×4 matrix so the "catch point" (internal vs external) stays interpretable. Items describe **behavior in a window**, not identity ("In the last 48 hours, I…"), to avoid trait-pathologizing. |
| 3 | **Trauma-informed counselor** | Add a **non-scored wellbeing check** that can route a distressed user to a softer result + a "this isn't therapy / here's where to get support" line, and de-emphasize the upsell for them. No item should shame. |
| 4 | **Behavioral scientist** | Favor observable actions over self-concept; keep the 48-hour recall window (better accuracy than "in general"). |
| 5 | **Physician / performance-wellness** (Dr. Mogire's field) | Frame the 4Cs as **energy leaks** that tax high-performers, *without medical claims*. No diagnosis language. |
| 6 | **Pastoral / formation (KOORA)** | Keep "return," "the next faithful choice," stewardship-of-attention framing. The Return chapter is the spiritual heart — hence worth doubling. |
| 7 | **Cross-cultural / East Africa** | Comparison via social feeds, communal vs individual framing, KSh pricing already present; ensure examples aren't Western-only. |
| 8 | **Assessment UX** | 30 items must still finish in ~6–7 min on mobile. Keep chapter openers; show honest progress ("of 30"); 5 short chapters of 6. |
| 9 | **Ethics / safeguarding & data** | Only collect what's used. The wellbeing check is **not stored as a score** and not sold; consent already captured. Add a one-line data note. |
| 10 | **Adult-learning / coaching** | The reveal must *teach*. Every result ends in one practice + a growth sentence the person can repeat. Expansion must deepen insight, not just lengthen the quiz. |

---

## 2. Current model (what we keep)

From `compute()` in `index.html` today:

- **4 C's × 4 domains** (Think, Feel, Choose, Do) = **16 matrix items**
  (item index = `c*4 + d`).
- **4 Return items** = capacity to notice / interrupt / redirect / practice.
- Derived: dominant C, secondary C, vulnerable domain, **hot zone** (the single
  highest C×domain cell), **catch point** (internal = Think+Feel ≥ Choose+Do,
  else external), Return score/band, and a **practice** keyed to the vulnerable
  domain.

This structure is good. The expansion **strengthens** it rather than replacing it.

## 3. Recommended 30-item structure (16 + 8 + 4 + 2)

| Block | Items | Scored? | Purpose |
|-------|-------|---------|---------|
| **A. Core matrix** (existing) | 16 | Yes — C-score + domain-score | The 4C × 4-domain grid. Keep/lightly refine current items. |
| **B. Return capacity** (expand 4→8) | 8 | Yes — Return score (0–24) | Reliable measure of how fast you catch & come back. |
| **C. Signature items** (1 per C) | 4 | Yes — adds to that C's score | Hallmark of each reflex, not domain-bound; stabilizes "dominant C". |
| **D. Wellbeing + context** | 2 | **No** (routing/personalization only) | Safety check + trigger context. Never affects the C-scores or is sold. |

**Total = 30.** Presented as **5 chapters of 6** (Complain, Criticize, Compare,
Compete, Return), with the 2 non-scored items folded into the intake/Return
flow so the experience stays clean.

### New item stems (draft, in the existing voice)

**C. Signature items** — "In the last 48 hours…"
- *Complaining:* "I described a situation as unfair or impossible more than I described what I could do about it."
- *Criticizing:* "I found the flaw in a person or plan faster than I found anything workable in it."
- *Comparing:* "I checked how I was doing against someone else before I checked how I was doing against my own intention."
- *Competing:* "Keeping my edge mattered more, in the moment, than getting better."

**B. Return capacity (4 new, joining the 4 existing)** — first person:
- "I caught the pattern while it was still just a thought or a feeling, before it became words or action."
- "When I noticed the leak, I named it in one word instead of spiraling on it."
- "I came back to what was actually mine to do within a few minutes, not hours."
- "I used a specific practice (a breath, a question, a pause) rather than just willpower or self-criticism."

**D. Wellbeing + context (not scored):**
- *Wellbeing (routing):* "Lately, how much is this pattern affecting your sleep, mood, work, or relationships?" — *Not at all / A little / Noticeably / A lot.* A "A lot" response softens the result, adds a brief supportive note, and replaces the upsell with a "here's a gentler next step / consider talking to someone you trust or a professional" message.
- *Context (personalization):* "Where does this show up most right now?" — *Work / Family / Money / Faith / Health / Online.* Used only to tailor the example in the reveal.

## 4. Scoring changes (implementation impact)

In `compute()`:
- `cS[c]` sums **5** items per C (4 matrix + 1 signature) → range 0–15. Dominant/secondary C logic unchanged.
- `dS[d]` stays from the **16 matrix items only** (keeps the hot-zone/catch-point math intact).
- `rS` sums **8** Return items → 0–24. Rebanded: weak < 8, emerging 8–13, strengthening 14–19, practiced ≥ 20.
- Wellbeing item: a separate flag, **not** in any score. Drives result tone + the supportive-routing branch.
- Context item: a string used only to pick the reveal example.

UX: progress reads "of 30"; processing/reveal copy unchanged; completion target ≤ 7 min.

## 5. Safety, ethics, and claims (non-negotiables)

- **No diagnosis.** Add a standing line in the reveal: *"This is a self-reflection
  tool, not a medical or psychological diagnosis."*
- **Distress routing** via the wellbeing item (above), including a neutral
  "talk to someone you trust or a licensed professional" line. (You may localize
  a Kenya/East-Africa support resource.)
- **Data minimization.** The wellbeing answer informs the on-screen result only;
  document whether it is sent to the CRM at all (recommendation: **no**).
- **Language review** for non-stigmatizing, culturally-fitting phrasing.

## 6. Recommended real-world validation (before "valid/validated" claims)

1. **Expert content review** — 1 psychometrician + 1 licensed clinician sign off on items/scoring/safety.
2. **Small pilot (n ≈ 30–50)** — check completion time, drop-off, item spread, internal consistency (Cronbach's α) per C and for Return.
3. **Face-validity check** with 5–8 target users ("did the result feel true and useful?").
4. Only after that, use language like "measures" / "your 4C profile" with confidence.

## 7. What I need from you to proceed

1. **Approve / edit** the structure (§3) and the draft items (§3).
2. Decide whether the **wellbeing answer is stored** (default: no).
3. Confirm you want me to **implement the approved 30-item version** behind the
   same flow, with the scoring in §4 and the safety routing in §5 — shipped as a
   reviewed PR, live only on your go.

*(Separately: the live 4C backend switch to Google Apps Script is on hold for
your deployed `/exec` URL; HighLevel capture stays live until then.)*
