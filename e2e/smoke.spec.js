// End-to-end smoke test for the 4C Personal Task Assessment: drive the full
// flow (arrival → name → 30 items → processing → PDF-detail gate → reveal)
// and assert the personalized result renders and the lead is captured. The
// full PDF-detail gate at the end is what unlocks (and submits) the results.
// Intercepts /api/ghl and the Apps Script sink so no real lead is sent.
const { test, expect } = require('@playwright/test');

test('arrival → name → 30 items → gate → reveal → lead captured', async ({ page }) => {
  test.setTimeout(90000); // 30 items + chapter openers + 3.5s processing + staggered reveal
  // Capture the lead payload the app POSTs to the Pages Function.
  let captured = null;
  await page.route('**/api/ghl', async (route) => {
    try { captured = JSON.parse(route.request().postData() || '{}'); } catch (_) { captured = {}; }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, forwarded: true }) });
  });
  // Stub the secondary Apps Script (Google Sheets) sink so CI never writes a
  // synthetic lead to the real spreadsheet, and capture it to prove fallback wiring.
  let gasCaptured = null;
  await page.route('**script.google.com/**', async (route) => {
    try { gasCaptured = JSON.parse(route.request().postData() || '{}'); } catch (_) { gasCaptured = {}; }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });

  await page.goto('/');

  // Arrival.
  await expect(page.locator('#s0')).toBeVisible();
  await page.click('#s0 button');

  // Start: full name only gates the Begin button.
  await expect(page.locator('#s1')).toBeVisible();
  await page.fill('#fn', 'Alex Doe');
  await expect(page.locator('#bs2')).toBeEnabled();
  await page.click('#bs2');

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

  // Processing holds ~3.5s, then the PDF-detail gate appears (the unlock).
  await expect(page.locator('#sg')).toBeVisible({ timeout: 10000 });
  await page.fill('#em', 'alex@example.com');
  await page.fill('#ph', '+254700000000');
  await page.selectOption('#ge', { label: 'Male' });
  await page.selectOption('#ag', { label: '36-45' });
  await page.selectOption('#sr', { label: 'Instagram' });
  await expect(page.locator('#bReveal')).toBeEnabled();
  await page.click('#bReveal');

  // Results are released only after the gate.
  await expect(page.locator('#s4')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('#rN')).toHaveText(/Alex/);
  // The personalized result layers render (where your power goes, practice, etc.).
  await expect(page.locator('#rL .rl').first()).toBeVisible();
  await expect(page.locator('#rL')).toContainText('Your one practice');
  await expect(page.locator('#rL')).toContainText('growth sentence');
  await expect(page.locator('#rL')).toContainText('ALCARRA screen');
  await expect(page.locator('#rL')).toContainText('Your PDF report is in your email');

  // The lead was captured with the contact shape the Function validates.
  await expect.poll(() => (captured && captured.contact ? captured.contact.name : null), { timeout: 5000 })
    .toBe('Alex Doe');
  expect(captured.contact.email).toBe('alex@example.com');
  expect(captured.contact.phone).toBe('+254700000000');
  expect(captured.segmentation.ageRange).toBe('36-45');
  expect(captured.segmentation.gender).toBe('Male');
  expect(captured.segmentation.source).toBe('Instagram');
  expect(captured.assessment).toBeTruthy();
  expect(typeof captured.assessment.dominantC).toBe('string');

  // Apps Script is a fallback only: when /api/ghl returns ok, the Sheet post is
  // skipped, so gasCaptured stays null. (It fires only if /api/ghl fails.)
  expect(gasCaptured).toBeNull();
  // The two non-scored closing answers stay private; only the 28 scored
  // answers are transmitted.
  expect(captured.assessment.answers.split(',')).toHaveLength(28);
});
