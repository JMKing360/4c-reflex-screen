// Cloudflare Pages Function: POST /api/csp-report
//
// Receives Content-Security-Policy violation reports during the Report-Only
// rollout (see _headers). It normalizes both wire formats — the legacy
// `report-uri` body (application/csp-report) and the Reporting API
// `report-to` body (application/reports+json) — and logs a compact one-line
// summary per violation. Tail it with `wrangler pages deployment tail` (or the
// Cloudflare dashboard logs) during the validation window: a clean stream over
// real traffic is the signal to promote the Report-Only allowlist to enforcing.
//
// It is intentionally side-effect-free beyond logging (no secrets, no external
// calls) and always answers 204 so a misbehaving report can never surface an
// error to a visitor's browser.

const MAX_BODY_BYTES = 64 * 1024; // 64 KB cap; reports are tiny, this is abuse protection.

// Pull the fields we care about out of either wire format.
function summarize(report) {
  // Reporting API (report-to): { type, body: { documentURL, effectiveDirective, blockedURL, ... } }
  const b = report && report.body ? report.body : report;
  if (!b || typeof b !== 'object') return null;
  const directive =
    b['effective-directive'] || b.effectiveDirective ||
    b['violated-directive'] || b.violatedDirective || '?';
  const blocked = b['blocked-uri'] || b.blockedURL || '?';
  const docUri = b['document-uri'] || b.documentURL || '?';
  return { directive, blocked, docUri };
}

export async function onRequestPost({ request }) {
  try {
    const len = Number(request.headers.get('Content-Length') || '0');
    if (len > MAX_BODY_BYTES) return new Response(null, { status: 204 });

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES || !raw.trim()) {
      return new Response(null, { status: 204 });
    }

    const parsed = JSON.parse(raw);
    // Legacy format wraps a single report under "csp-report"; the Reporting API
    // sends an array of reports.
    const reports = Array.isArray(parsed)
      ? parsed
      : [parsed['csp-report'] ? parsed['csp-report'] : parsed];

    for (const r of reports) {
      const s = summarize(r);
      if (s) {
        console.log(`[csp-report] directive=${s.directive} blocked=${s.blocked} doc=${s.docUri}`);
      }
    }
  } catch (_) {
    // Malformed report — swallow it. Never error the browser over telemetry.
  }
  return new Response(null, { status: 204 });
}

// Reports are always POSTed; answer other methods cleanly without erroring.
export async function onRequest({ request }) {
  if (request.method === 'POST') return onRequestPost({ request });
  return new Response(null, { status: 405, headers: { Allow: 'POST' } });
}
