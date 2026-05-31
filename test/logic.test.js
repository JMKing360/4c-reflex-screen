// Buildless regression tests for the quiz scoring, HTML-escaping, UTM capture,
// and the Pages Function payload validation. Run with: npm test
//
// These extract the relevant logic out of the source files (no bundler) so the
// 1700-line single-file app stays protected against silent regressions.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

/* ── Load scoring/escape/UTM logic from the inline <script> ─────────── */
function loadInlineLogic() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  // Match the main inline script (the long one before </body>). Tolerant of
  // whitespace/comments between </script> and </body>.
  const m = html.match(/<script>([\s\S]+)<\/script>[\s\S]*<\/body>/);
  if (!m) throw new Error('inline script not found in index.html');
  const stubs = `
    var window = { addEventListener: function(){},
      location: { search: '?utm_source=fb&utm_medium=cpc&utm_campaign=spring', href: 'https://4c.houseofmastery.co/' } };
    var document = { getElementById: function(){ return { style:{}, setAttribute:function(){}, focus:function(){} }; },
      addEventListener: function(){}, querySelector: function(){ return null; },
      querySelectorAll: function(){ return []; }, createElement: function(){ return {}; } };
  `;
  const wrapped = stubs + m[1] +
    '\nmodule.exports = { getReflexScore, getCostScore, getRhythmScore, getLevel, escapeHTML, ATTRIBUTION,' +
    ' setAnswers: function(a){ answers = a; } };';
  const tmp = path.join(require('node:os').tmpdir(), 'inline_logic_' + process.pid + '.js');
  fs.writeFileSync(tmp, wrapped);
  const mod = require(tmp);
  fs.unlinkSync(tmp);
  return mod;
}

/* ── Load validate() from the Pages Function ────────────────────────── */
function loadValidate() {
  let src = fs.readFileSync(path.join(ROOT, 'functions/api/ghl.js'), 'utf8');
  src = src.replace(/export async function/g, 'async function');
  const sandbox = {};
  const factory = new Function(src + '\n; this.validate = validate;');
  factory.call(sandbox);
  return sandbox.validate;
}

const L = loadInlineLogic();
const validate = loadValidate();

const all = (v) => { const o = {}; for (let i = 1; i <= 30; i++) o[i] = v; return o; };

test('reflex score: all-4 answers max out a 4-question reflex', () => {
  L.setAnswers(all(4));
  assert.strictEqual(L.getReflexScore('complaining'), 16);
});

test('reflex score: all-1 answers floor a reflex', () => {
  L.setAnswers(all(1));
  assert.strictEqual(L.getReflexScore('complaining'), 4);
});

test('cost score spans 10 questions (10..40)', () => {
  L.setAnswers(all(1)); assert.strictEqual(L.getCostScore(), 10);
  L.setAnswers(all(4)); assert.strictEqual(L.getCostScore(), 40);
});

test('rhythm score spans 4 questions (4..16)', () => {
  L.setAnswers(all(1)); assert.strictEqual(L.getRhythmScore(), 4);
  L.setAnswers(all(4)); assert.strictEqual(L.getRhythmScore(), 16);
});

test('level thresholds: quiet <=0.44, active <=0.69, loud above', () => {
  assert.strictEqual(L.getLevel(4, 16), 'quiet');   // 0.25
  assert.strictEqual(L.getLevel(7, 16), 'quiet');   // 0.4375
  assert.strictEqual(L.getLevel(10, 16), 'active'); // 0.625
  assert.strictEqual(L.getLevel(11, 16), 'active'); // 0.6875
  assert.strictEqual(L.getLevel(12, 16), 'loud');   // 0.75
});

test('escapeHTML neutralises script-injection characters', () => {
  assert.strictEqual(L.escapeHTML('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
  assert.strictEqual(L.escapeHTML('"\'' + '&'), '&quot;&#39;&amp;');
});

test('ATTRIBUTION captures UTM params from the query string', () => {
  assert.strictEqual(L.ATTRIBUTION.utm_source, 'fb');
  assert.strictEqual(L.ATTRIBUTION.utm_medium, 'cpc');
  assert.strictEqual(L.ATTRIBUTION.utm_campaign, 'spring');
});

test('validate: accepts a name-only (email-less) completion', () => {
  assert.strictEqual(validate({ contact: { name: 'Sam' } }), null);
});

test('validate: accepts a valid email', () => {
  assert.strictEqual(validate({ contact: { name: 'Sam', email: 'a@b.co' } }), null);
});

test('validate: rejects missing/empty/oversized name, bad email, non-objects', () => {
  assert.strictEqual(typeof validate({}), 'string');
  assert.strictEqual(typeof validate({ contact: { name: '   ' } }), 'string');
  assert.strictEqual(typeof validate({ contact: { name: 'x'.repeat(201) } }), 'string');
  assert.strictEqual(typeof validate({ contact: { name: 'Sam', email: 'nope' } }), 'string');
  assert.strictEqual(typeof validate(null), 'string');
});
