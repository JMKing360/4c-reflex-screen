# Archived assessments

These are complete, self-contained snapshots of assessments that previously
lived on `4c.houseofmastery.co`, kept here so they can be revived on their own
sites without digging through git history. The live app on `main` is the **4C
Personal Task Assessment**.

| File / branch | Assessment | Notes |
| --- | --- | --- |
| `emotional-sovereignty-screen.zip` | The Emotional Sovereignty Screen | 30-question reflex model + full infra (EmailJS/HighLevel/Turnstile/GA4/jsPDF, security headers, tests). Snapshot of commit `1015856`. Also on branch `archive/emotional-sovereignty-screen`. |
| branch `archive/4c-reflex-screen-koora` | The 4C Reflex Screen · KOORA | 20-statement reflex variant, no backend wired. |

`archives/` is excluded from the Cloudflare Pages deploy, so nothing here is
served on the live site.

To revive one as a new site: unzip (or check out the branch) into a fresh repo,
point a new Cloudflare Pages project at it, and set its own domain/secrets.
