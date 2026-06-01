// Buildless regression tests for the deployment infrastructure: the Cloudflare
// Pages security headers (_headers), the PWA manifest, and that index.html
// wires both up. These guard the security posture against silent erosion and
// keep the CSP allowlist honest about what the app actually loads.
//
// Run with: npm test

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

/* ── _headers: security posture ─────────────────────────────────────── */
test('_headers exists and sets the transport/isolation headers', () => {
  const h = read('_headers');
  assert.match(h, /Strict-Transport-Security:\s*max-age=\d+/, 'HSTS missing');
  assert.match(h, /X-Content-Type-Options:\s*nosniff/, 'nosniff missing');
  assert.match(h, /Referrer-Policy:\s*strict-origin-when-cross-origin/, 'Referrer-Policy missing');
  assert.match(h, /Permissions-Policy:.*\bmicrophone=\(\)/, 'Permissions-Policy missing/weak');
  assert.match(h, /Cross-Origin-Opener-Policy:\s*same-origin/, 'COOP missing');
});

test('_headers enforces the no-break CSP directives', () => {
  const h = read('_headers');
  // The enforced policy (not Report-Only) must lock these down, since none of
  // them can break the funnel.
  const enforced = h.match(/^\s*Content-Security-Policy:\s*(.+)$/m);
  assert.ok(enforced, 'enforced Content-Security-Policy line missing');
  const csp = enforced[1];
  assert.match(csp, /object-src 'none'/, "object-src 'none' not enforced");
  assert.match(csp, /base-uri 'self'/, "base-uri 'self' not enforced");
  assert.match(csp, /form-action 'self'/, "form-action 'self' not enforced");
  assert.match(csp, /frame-ancestors 'self' https:\/\/\*\.houseofmastery\.co/, 'frame-ancestors not enforced');
  // The enforced policy must NOT carry a restrictive default-src — that would
  // block the external scripts/styles/fonts the app legitimately loads.
  assert.doesNotMatch(csp, /default-src/, 'enforced CSP must not include default-src (would break external resources)');
});

test('CSP violations are wired to the reporting endpoint', () => {
  const h = read('_headers');
  assert.match(h, /Reporting-Endpoints:\s*csp-endpoint="\/api\/csp-report"/, 'Reporting-Endpoints header missing');
  const ro = h.match(/Content-Security-Policy-Report-Only:\s*(.+)$/m);
  assert.ok(ro, 'Report-Only CSP missing');
  assert.match(ro[1], /report-to csp-endpoint/, 'report-to directive missing');
  assert.match(ro[1], /report-uri \/api\/csp-report/, 'report-uri fallback missing');
  // The endpoint must exist and be syntactically loadable as a module.
  assert.ok(fs.existsSync(path.join(ROOT, 'functions/api/csp-report.js')), 'csp-report function missing');
});

test('Report-Only CSP allowlist covers every external origin the app uses', () => {
  const h = read('_headers');
  const ro = h.match(/Content-Security-Policy-Report-Only:\s*(.+)$/m);
  assert.ok(ro, 'Report-Only CSP missing');
  const csp = ro[1];
  // The 4C Personal Task Assessment loads no external scripts — only Google
  // Fonts. Keep this in lockstep with the actual dependencies in index.html.
  for (const origin of [
    'https://fonts.googleapis.com',      // Google Fonts CSS
    'https://fonts.gstatic.com',         // Google Fonts files
  ]) {
    assert.ok(csp.includes(origin), `Report-Only CSP missing ${origin}`);
  }
  // Connect is locked to same-origin (only /api/ghl + /api/csp-report).
  assert.match(csp, /connect-src 'self'/, 'connect-src should be self-only');
});

test('every https origin the app references is allowed by the CSP', () => {
  // Catch the reverse drift: a new external dependency added to index.html that
  // nobody added to the CSP. Origins served by our own first-party function or
  // used only as user-facing navigation (the brand site) are exempt.
  const html = read('index.html');
  const csp = read('_headers');
  const EXEMPT = new Set([
    'https://4c.houseofmastery.co',   // canonical / og (self)
    'https://houseofmastery.co',      // CTA navigation
    'https://www.houseofmastery.co',  // CTA navigation
  ]);
  const origins = new Set((html.match(/https:\/\/[a-zA-Z0-9.-]+/g) || []));
  for (const o of origins) {
    if (EXEMPT.has(o)) continue;
    const host = o.replace('https://', '');
    const wildcard = 'https://*.' + host.split('.').slice(1).join('.');
    assert.ok(
      csp.includes(o) || csp.includes(wildcard),
      `index.html loads ${o} but the CSP does not allow it`
    );
  }
});

/* ── PWA manifest ───────────────────────────────────────────────────── */
test('manifest.webmanifest is valid JSON with the required fields', () => {
  const m = JSON.parse(read('manifest.webmanifest'));
  assert.ok(m.name && m.short_name, 'name/short_name missing');
  assert.strictEqual(m.start_url, '/');
  assert.strictEqual(m.display, 'standalone');
  assert.ok(Array.isArray(m.icons) && m.icons.length > 0, 'icons missing');
  // Theme/background must match the 4C app's shipped look (white surface, ink).
  assert.strictEqual(m.theme_color, '#1D1D1F', 'theme_color must be the app ink');
  assert.strictEqual(m.background_color, '#FFFFFF', 'background_color must be white');
});

test('index.html wires up the manifest and theme-color', () => {
  const html = read('index.html');
  assert.match(html, /<link\s+rel="manifest"\s+href="\/manifest\.webmanifest">/, 'manifest link missing');
  assert.match(html, /<meta\s+name="theme-color"\s+content="#1D1D1F">/, 'theme-color meta missing/wrong');
});
