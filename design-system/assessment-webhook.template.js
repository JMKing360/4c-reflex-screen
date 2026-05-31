// ============================================================================
// REUSABLE TEMPLATE — Cloudflare Pages Function: POST /api/ghl
// Validates an assessment lead payload and forwards it to a HighLevel (GHL)
// webhook. Copy to functions/api/ghl.js in a new House of Mastery property and
// adjust DEFAULT_ALLOWED_ORIGINS for that property's domains.
//
// Env vars (set in the Cloudflare Pages project, never committed):
//   GHL_WEBHOOK_URL    (required) the HighLevel inbound webhook
//   ALLOWED_ORIGINS    (optional) comma-separated extra origins
//   TURNSTILE_SECRET   (optional) enables Turnstile verification — set ONLY
//                      together with the client-side site key, or all
//                      submissions fail (the client sends no token otherwise).
// ============================================================================

const MAX_BODY_BYTES = 64 * 1024; // 64 KB hard cap on inbound payloads.

// Origins allowed to call this endpoint. Override/extend with the
// ALLOWED_ORIGINS env var (comma-separated) without editing code.
// CHANGE THESE for a new property.
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

async function verifyTurnstile(token, secret, request) {
  try {
    const form = new FormData();
    form.append('secret', secret);
    form.append('response', token);
    const ip = request.headers.get('CF-Connecting-IP');
    if (ip) form.append('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form
    });
    const data = await res.json().catch(() => ({ success: false }));
    return data.success === true;
  } catch (e) {
    console.error('Turnstile verification error', e);
    return false;
  }
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

  // Verify the Cloudflare Turnstile token when a secret is configured. When no
  // secret is set the check is skipped (Turnstile disabled), so the endpoint
  // keeps working until you turn it on.
  // WARNING: only set TURNSTILE_SECRET once the client TURNSTILE_SITE_KEY is
  // also set (index.html). Enabling the secret alone makes the client send no
  // token and every submission fails the check below.
  if (env.TURNSTILE_SECRET) {
    const token = payload.turnstile_token;
    if (!token) {
      return jsonResponse({ ok: false, error: 'Captcha verification required.' }, 400, headers);
    }
    const verify = await verifyTurnstile(token, env.TURNSTILE_SECRET, request);
    if (!verify) {
      return jsonResponse({ ok: false, error: 'Captcha verification failed.' }, 403, headers);
    }
  }

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
