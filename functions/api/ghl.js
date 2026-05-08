const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: jsonHeaders });
}

export async function onRequestPost({ request, env }) {
  let payload;

  try {
    payload = await request.json();
  } catch (error) {
    return jsonResponse({ ok: false, error: 'Invalid JSON payload.' }, 400);
  }

  const webhookUrl = env.GHL_WEBHOOK_URL || env.HIGHLEVEL_WEBHOOK_URL;

  if (!webhookUrl) {
    return jsonResponse({
      ok: true,
      forwarded: false,
      reason: 'GHL_WEBHOOK_URL is not configured for this Cloudflare Pages project.'
    });
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
    return jsonResponse({ ok: false, forwarded: false, error: 'Unable to reach HighLevel webhook.' }, 502);
  }

  if (!ghlResponse.ok) {
    const responseText = await ghlResponse.text().catch(() => '');
    return jsonResponse({
      ok: false,
      forwarded: false,
      status: ghlResponse.status,
      error: responseText.slice(0, 500) || 'HighLevel webhook returned an error.'
    }, 502);
  }

  return jsonResponse({ ok: true, forwarded: true });
}
