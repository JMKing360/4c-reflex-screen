// Buildless regression tests for the 4C Personal Task Assessment scoring engine
// (compute()) and the Pages Function payload validation. Run with: npm test
//
// These extract the relevant logic out of the single-file app (no bundler) so
// the scoring stays protected against silent regressions.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

/* ── Load compute() + constants from the inline <script> ────────────── */
function loadInlineLogic() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const m = html.match(/<script>([\s\S]+)<\/script>[\s\S]*<\/body>/);
  if (!m) throw new Error('inline script not found in index.html');
  // A chainable dummy DOM element so the script's top-level wiring
  // (input listeners) runs without a browser.
  const stubs = `
    var __el = { style:{}, value:'', checked:false, textContent:'', innerHTML:'',
      dataset:{}, setAttribute:function(){}, focus:function(){},
      addEventListener:function(){}, classList:{add:function(){},remove:function(){},contains:function(){return false;}},
      getContext:function(){ return {}; } };
    var window = { addEventListener:function(){}, scrollTo:function(){},
      location:{ search:'', href:'https://4c.houseofmastery.co/' } };
    var document = { getElementById:function(){ return __el; }, addEventListener:function(){},
      querySelector:function(){ return __el; }, querySelectorAll:function(){ return []; },
      createElement:function(){ return __el; } };
    var requestAnimationFrame = function(){};
    var setTimeout = function(){};
  `;
  const wrapped = stubs + m[1] +
    '\nmodule.exports = { compute, CN, DN, CI, DI, PR,' +
    ' setAns:function(a){ ans = a; }, getRes:function(){ return res; } };';
  const tmp = path.join(require('node:os').tmpdir(), 'inline_4c_' + process.pid + '.js');
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

// Build a 20-item answer array (16 matrix items c*4+d, then 4 Return items).
const zeros = () => new Array(20).fill(0);

test('compute: dominant C is the highest-summing reflex', () => {
  const a = zeros();
  a[0] = a[1] = a[2] = a[3] = 3; // all four Complaining items maxed
  L.setAns(a); L.compute();
  const r = L.getRes();
  assert.strictEqual(r.dc, 0, 'dominant C index');
  assert.strictEqual(L.CN[r.dc], 'Complaining');
  assert.strictEqual(r.sc, 1, 'secondary C is the next-highest (tie → first)');
});

test('compute: vulnerable domain + hot zone derive from the matrix', () => {
  const a = zeros();
  a[0] = a[1] = a[2] = a[3] = 3; // Complaining across all four domains
  L.setAns(a); L.compute();
  const r = L.getRes();
  // Each domain gets one '3' from the Complaining row → tie → Think (index 0).
  assert.strictEqual(r.dd, 0);
  assert.strictEqual(L.DN[r.dd], 'Think');
  // Highest single matrix answer is index 0 → Complaining x Think.
  assert.strictEqual(r.hc, 0);
  assert.strictEqual(r.hd, 0);
});

test('compute: catch point is internal when think+feel >= choose+do', () => {
  const internal = zeros();
  internal[0] = internal[1] = 3; // think+feel weighted
  L.setAns(internal); L.compute();
  assert.strictEqual(L.getRes().cp, 'internal');

  const external = zeros();
  // Weight choose+do (domains 2,3) across reflexes.
  for (let c = 0; c < 4; c++) { external[c * 4 + 2] = 3; external[c * 4 + 3] = 3; }
  L.setAns(external); L.compute();
  assert.strictEqual(L.getRes().cp, 'external');
});

test('compute: return score sums the 4 Return items and maps to a band', () => {
  const bands = [
    [[0, 0, 0, 1], 1, 'weak'],
    [[1, 1, 1, 1], 4, 'emerging'],
    [[2, 2, 2, 2], 8, 'strengthening'],
    [[3, 3, 3, 2], 11, 'practiced'],
  ];
  for (const [ret, expScore, expBand] of bands) {
    const a = zeros();
    a[16] = ret[0]; a[17] = ret[1]; a[18] = ret[2]; a[19] = ret[3];
    L.setAns(a); L.compute();
    const r = L.getRes();
    assert.strictEqual(r.rS, expScore, `return score for ${ret}`);
    assert.strictEqual(r.rL, expBand, `return band for ${ret}`);
  }
});

test('compute: practice is keyed to the vulnerable domain', () => {
  const a = zeros();
  a[0] = a[1] = a[2] = a[3] = 3; // dd → Think
  L.setAns(a); L.compute();
  const r = L.getRes();
  assert.ok(L.PR[L.DI[r.dd]], 'a practice exists for the vulnerable domain');
  assert.strictEqual(L.PR[L.DI[r.dd]].n, L.PR.think.n);
});

/* ── /api/ghl payload validation (unchanged contract) ───────────────── */
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
