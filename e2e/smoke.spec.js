// End-to-end smoke test: drive the full quiz flow and assert the gate behaviour.
// Intercepts /api/ghl so no real CRM call is made.
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // Stub the Pages Function so the lead capture resolves without a backend.
  await page.route('**/api/ghl', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, forwarded: true }) })
  );
});

test('welcome → 30 questions → gated results → unlock', async ({ page }) => {
  await page.goto('/');

  // Welcome screen.
  await expect(page.locator('#slide-welcome')).toBeVisible();
  await page.fill('#participantName', 'Alex');
  await page.click('text=Name What Is Running You');

  // Answer all 30 questions. Auto-advance fires on click; the last click
  // builds the results.
  const question = page.locator('#slide-question');
  await expect(question).toBeVisible();
  for (let i = 0; i < 30; i++) {
    await expect(page.locator('#qText')).not.toHaveText('');
    const counterBefore = i < 29 ? await page.locator('#navCounter').textContent() : null;
    // Pick the second option ("Sometimes") each time.
    await page.locator('#optionsStack .opt-btn').nth(1).click();
    if (i < 29) {
      // Wait for the auto-advance to actually move to the next question
      // instead of racing a fixed timeout.
      await expect(page.locator('#navCounter')).not.toHaveText(counterBefore || '', { timeout: 5000 });
    }
  }

  // Results: scores + teaser visible, but locked content hidden.
  await expect(page.locator('#slide-results')).toBeVisible();
  await expect(page.locator('#scoreTable .score-row').first()).toBeVisible();
  await expect(page.locator('#resultsTeaser')).toContainText('loudest pattern');
  await expect(page.locator('#lockedContent')).toBeHidden();

  // Gate enforces a valid email.
  await page.click('#btnSendEmail');
  await expect(page.locator('#emailStatus')).toContainText('valid email');

  // Gate enforces consent.
  await page.fill('#emailInput', 'alex@example.com');
  await page.click('#btnSendEmail');
  await expect(page.locator('#emailStatus')).toContainText('agree');

  // Tick consent and submit → content unlocks.
  await page.check('#consentCheck');
  await page.click('#btnSendEmail');
  await expect(page.locator('#lockedContent')).toBeVisible();
  await expect(page.locator('#reflexCards .reflex-card').first()).toBeVisible();
});
