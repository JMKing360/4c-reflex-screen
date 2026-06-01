// End-to-end smoke test for the 4C Personal Task Assessment: drive the full
// flow (arrival → intake → 20 items across 5 chapters → processing → reveal)
// and assert the personalized result renders and the lead is captured.
// Intercepts /api/ghl so no real CRM call is made.
const { test, expect } = require('@playwright/test');

test('arrival → intake → 20 items → personalized reveal → lead captured', async ({ page }) => {
  test.setTimeout(60000); // 20 items + chapter openers + 3.5s processing + staggered reveal
  // Capture the lead payload the app POSTs to the Pages Function.
  let captured = null;
  await page.route('**/api/ghl', async (route) => {
    try { captured = JSON.parse(route.request().postData() || '{}'); } catch (_) { captured = {}; }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, forwarded: true }) });
  });

  await page.goto('/');

  // Arrival.
  await expect(page.locator('#s0')).toBeVisible();
  await page.click('#s0 button');

  // Intake step 1: name + email + WhatsApp gate the Continue button.
  await expect(page.locator('#st1')).toBeVisible();
  await page.fill('#fn', 'Alex');
  await page.fill('#ln', 'Doe');
  await page.fill('#em', 'alex@example.com');
  await page.fill('#ph', '+254700000000');
  await expect(page.locator('#bs2')).toBeEnabled();
  await page.click('#bs2');

  // Intake step 2 is optional → start the assessment.
  await expect(page.locator('#st2')).toBeVisible();
  await page.click('text=Start the assessment');

  // Journey: 5 chapter openers + 20 questions. Each chapter starts with an
  // opener ("Continue"); every item then shows four options.
  await expect(page.locator('#s2')).toBeVisible();
  let answered = 0;
  while (answered < 20) {
    // Each step shows either a chapter opener ("Continue") or the question's
    // four options. Wait for whichever lands, then advance.
    await expect(page.locator('#jc .opener button, #jc .opt').first()).toBeVisible({ timeout: 6000 });
    const opener = page.locator('#jc .opener button');
    if (await opener.count() && await opener.first().isVisible()) {
      await opener.first().click();
    }
    const option = page.locator('#jc .opt').first();
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
    answered++;
    // sel() runs a 350ms exit + 250ms swap before the next item renders.
    await page.waitForTimeout(650);
  }

  // Processing holds ~3.5s, then the reveal appears.
  await expect(page.locator('#s4')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('#rN')).toHaveText(/Alex/);
  // The personalized result layers render (where your power goes, practice, etc.).
  await expect(page.locator('#rL .rl').first()).toBeVisible();
  await expect(page.locator('#rL')).toContainText('Your one practice');
  await expect(page.locator('#rL')).toContainText('growth sentence');

  // The lead was captured with the contact shape the Function validates.
  await expect.poll(() => (captured && captured.contact ? captured.contact.name : null), { timeout: 5000 })
    .toBe('Alex Doe');
  expect(captured.contact.email).toBe('alex@example.com');
  expect(captured.assessment).toBeTruthy();
  expect(typeof captured.assessment.dominantC).toBe('string');
});
