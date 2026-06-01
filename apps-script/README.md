# Google Sheets capture (secondary sink)

The live 4C assessment sends every completed lead to **two** places:

1. **HighLevel** — via the same-origin Cloudflare Function `POST /api/ghl` (primary; unchanged).
2. **Google Sheet** — via the Apps Script Web App in [`Code.gs`](./Code.gs) (secondary; best-effort).

Both get the **same JSON payload**. The Sheet capture is fire-and-forget and can
never block or break the HighLevel capture.

## One-time setup (≈3 minutes)

1. Open your Apps Script project and **replace the contents of `Code.gs`** with
   this folder's [`Code.gs`](./Code.gs). Save.
2. *(Optional)* To log into an existing spreadsheet, paste its id into
   `SHEET_ID` at the top. Otherwise the script creates one on first run and
   writes its URL to the execution log.
3. **Deploy ▸ New deployment ▸** select type **Web app**:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. Click **Deploy**, authorize when prompted, and **copy the Web app URL** — it
   ends in `/exec`.
5. Send me that `/exec` URL (or paste it yourself into `index.html` →
   `GAS_URL`, replacing the `…/PASTE_YOUR_DEPLOYMENT_ID/exec` placeholder).

That's it — the next completed assessment appends a row.

## Notes

- **Until the `PASTE_` placeholder is replaced, the Sheet capture stays OFF** and
  only HighLevel runs. No requests go to a dead URL.
- The browser posts with `mode:'no-cors'` and `text/plain` (a CORS-simple
  request), so no preflight and no CORS headers are needed; the row is still
  appended. We don't read the response.
- The CSP `connect-src` already allows `script.google.com` and its redirect
  target `script.googleusercontent.com` (see `_headers`); `test/infra.test.js`
  keeps that in lockstep with `GAS_URL`.
- **Re-deploying after code edits:** use **Deploy ▸ Manage deployments ▸ Edit ▸
  New version** to keep the *same* `/exec` URL. A brand-new deployment mints a
  new URL that you'd have to paste again.
- Column order is fixed by `HEADERS` in `Code.gs`; the header row is written
  automatically on the first submission.
