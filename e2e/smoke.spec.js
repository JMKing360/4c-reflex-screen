// End-to-end smoke test for the 4C Personal Task Assessment: drive the full
// flow (arrival → intake → 30 items across 6 chapters → processing → reveal)
// and assert the personalized result renders and the lead is captured.
// Intercepts /api/ghl so no real CRM call is made. (The secondary Apps Script
// Sheet call stays off behind the PASTE_ guard, so there is nothing else to stub.)
const { test, expect } = require('@playwright/test');

test('arrival → intake → 30 items → personalized reveal → lead captured', async ({ page }) => {
  test.setTimeout(90000); // 30 items + chapter openers + 3.5s processing + staggered reveal
  // Capture the lead payload the app POSTs to the Pages Function.
  let captured = null;
  await page.route('**/api/ghl', async (route) => {
    try { captured = JSON.parse(route.request().postData() || '{}'); } catch (_) { captured = {}; }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, forwarded: true }) });
  });
  // Stub the secondary Apps Script (Google Sheets) sink so CI never writes a
  // synthetic lead to the real spreadsheet — and capture it to prove dual-send.
  let gasCaptured = null;
  await page.route('**script.google.com/**', async (route) => {
    try { gasCaptured = JSON.parse(route.request().postData() || '{}'); } catch (_) { gasCaptured = {}; }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
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

  // Journey: 6 chapter openers + 30 items (incl. 2 non-scored closing items).
  // Each chapter starts with an opener; every item then shows its options.
  await expect(page.locator('#s2')).toBeVisible();
  let answered = 0;
  while (answered < 30) {
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

  // Dual capture: the same lead also reached the Apps Script (Sheets) sink.
  await expect.poll(() => (gasCaptured && gasCaptured.contact ? gasCaptured.contact.name : null), { timeout: 5000 })
    .toBe('Alex Doe');
  // The two non-scored closing answers stay private — only the 28 scored
  // answers are transmitted to either sink.
  expect(captured.assessment.answers.split(',')).toHaveLength(28);
});
