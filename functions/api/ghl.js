// Cloudflare Pages Function: POST /api/ghl
// Validates a quiz lead payload and forwards it to the HighLevel (GHL) webhook.

const MAX_BODY_BYTES = 64 * 1024; // 64 KB hard cap on inbound payloads.

// Origins allowed to call this endpoint. Override/extend with the
// ALLOWED_ORIGINS env var (comma-separated) without editing code.
const DEFAULT_ALLOWED_ORIGINS = [
  'https://4c.houseofmastery.co',
  'https://houseofmastery.co',
  'https://www.houseofmastery.co'
];

function allowedOrigins(env) {
  const extra = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...extra]);
}

function corsHeaders(env, request) {
  const origin = request.headers.get('Origin') || '';
  const allow = allowedOrigins(env);
  // Echo the origin only when it is on the allow-list; otherwise fall back to
  // the canonical app origin so the response is never an open wildcard.
  const allowOrigin = allow.has(origin) ? origin : 'https://4c.houseofmastery.co';
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function jsonResponse(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers });
}

export async function onRequestOptions({ request, env }) {
  return new Response(null, { status: 204, headers: corsHeaders(env, request) });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(payload) {
  if (typeof payload !== 'object' || payload === null) return 'Payload must be an object.';
  const contact = payload.contact;
  if (typeof contact !== 'object' || contact === null) return 'Missing contact.';
  if (typeof contact.name !== 'string' || contact.name.trim() === '') return 'Missing contact.name.';
  if (contact.name.length > 200) return 'contact.name is too long.';
  // Email is optional (the completed-quiz event has none), but when present it
  // must be syntactically valid.
  if (contact.email != null) {
    if (typeof contact.email !== 'string' || !EMAIL_RE.test(contact.email)) return 'contact.email is invalid.';
    if (contact.email.length > 320) return 'contact.email is too long.';
  }
  return null;
}

export async function onRequestPost({ request, env }) {
  const headers = corsHeaders(env, request);

  // Reject oversized bodies before reading them into memory.
  const declaredLength = parseInt(request.headers.get('Content-Length') || '0', 10);
  if (declaredLength && declaredLength > MAX_BODY_BYTES) {
    return jsonResponse({ ok: false, error: 'Payload too large.' }, 413, headers);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return jsonResponse({ ok: false, error: 'Payload too large.' }, 413, headers);
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (error) {
    return jsonResponse({ ok: false, error: 'Invalid JSON payload.' }, 400, headers);
  }

  const validationError = validate(payload);
  if (validationError) {
    return jsonResponse({ ok: false, error: validationError }, 400, headers);
  }

  // Note: the 4C Personal Task Assessment ships without a captcha, so this
  // endpoint no longer gates on Cloudflare Turnstile. (Re-add a verification
  // step here if a captcha is introduced on the client.)

  const webhookUrl = env.GHL_WEBHOOK_URL || env.HIGHLEVEL_WEBHOOK_URL;

  if (!webhookUrl) {
    // Fail loudly: a missing webhook means leads are being lost, so surface it
    // as a server error rather than a misleading success.
    console.error('GHL_WEBHOOK_URL is not configured; lead was not forwarded.');
    return jsonResponse({
      ok: false,
      forwarded: false,
      error: 'Lead capture is temporarily unavailable.'
    }, 503, headers);
  }

  const forwardedPayload = {
    ...payload,
    meta: {
      ...(payload.meta || {}),
      received_at: new Date().toISOString(),
      source_url: request.headers.get('Referer') || payload.source_url || null,
      user_agent: request.headers.get('User-Agent') || null,
      ip_country: request.cf && request.cf.country ? request.cf.country : null
    }
  };

  let ghlResponse;

  try {
    ghlResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(forwardedPayload)
    });
  } catch (error) {
    console.error('Unable to reach HighLevel webhook', error);
    return jsonResponse({ ok: false, forwarded: false, error: 'Unable to reach HighLevel webhook.' }, 502, headers);
  }

  if (!ghlResponse.ok) {
    const responseText = await ghlResponse.text().catch(() => '');
    console.error('HighLevel webhook returned', ghlResponse.status, responseText.slice(0, 200));
    return jsonResponse({
      ok: false,
      forwarded: false,
      status: ghlResponse.status,
      error: responseText.slice(0, 500) || 'HighLevel webhook returned an error.'
    }, 502, headers);
  }

  return jsonResponse({ ok: true, forwarded: true }, 200, headers);
}
