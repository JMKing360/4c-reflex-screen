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
    '\nmodule.exports = { compute, CN, DN, CI, DI, PR, IT,' +
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

// The 30-item instrument is metadata-driven (see IT in index.html): 16 matrix
// items {c,d}, 4 signature items {c,sig}, 8 Return items {ret}, and 2 non-scored
// closing items {kind:'wellbeing'|'context'}. Locate items by metadata, not by a
// fixed position, so the tests track the model rather than the array order.
const IT = L.IT;
const zeros = () => new Array(IT.length).fill(0);
const mIdx = (c, d) => IT.findIndex((it) => it.c === c && it.d === d);          // matrix cell
const sigIdx = (c) => IT.findIndex((it) => it.c === c && it.sig);               // signature item
const retIdxs = () => IT.map((it, i) => (it.ret ? i : -1)).filter((i) => i >= 0); // 8 Return items
const kindIdx = (k) => IT.findIndex((it) => it.kind === k);                     // non-scored item

test('IT has the expected 30-item shape (16 matrix + 4 signature + 8 return + 2 closing)', () => {
  assert.strictEqual(IT.length, 30, 'total items');
  assert.strictEqual(IT.filter((it) => typeof it.d === 'number').length, 16, 'matrix items');
  assert.strictEqual(IT.filter((it) => it.sig).length, 4, 'signature items');
  assert.strictEqual(retIdxs().length, 8, 'return items');
  assert.ok(kindIdx('wellbeing') >= 0 && kindIdx('context') >= 0, 'closing items present');
});

test('compute: dominant C is the highest-summing reflex (matrix + signature)', () => {
  const a = zeros();
  for (let d = 0; d < 4; d++) a[mIdx(0, d)] = 3; // four Complaining matrix items
  a[sigIdx(0)] = 3;                               // + Complaining signature
  L.setAns(a); L.compute();
  const r = L.getRes();
  assert.strictEqual(r.dc, 0, 'dominant C index');
  assert.strictEqual(L.CN[r.dc], 'Complaining');
  assert.strictEqual(r.cS[0], 15, 'dominant C sums all 5 of its items (4 matrix + 1 signature)');
  assert.strictEqual(r.sc, 1, 'secondary C is the next-highest (tie → first)');
});

test('compute: a signature item alone feeds its C score', () => {
  const a = zeros();
  a[sigIdx(2)] = 3; // only the Comparing signature
  L.setAns(a); L.compute();
  const r = L.getRes();
  assert.strictEqual(r.cS[2], 3, 'signature item contributes to the C score');
  assert.strictEqual(r.dc, 2, 'Comparing becomes dominant on its signature alone');
});

test('compute: vulnerable domain + hot zone derive from the matrix only', () => {
  const a = zeros();
  for (let d = 0; d < 4; d++) a[mIdx(0, d)] = 3; // Complaining across all four domains
  a[sigIdx(0)] = 3;                               // signature must NOT skew the domain math
  L.setAns(a); L.compute();
  const r = L.getRes();
  // Each domain gets one '3' from the Complaining row → tie → Think (index 0).
  assert.strictEqual(r.dd, 0);
  assert.strictEqual(L.DN[r.dd], 'Think');
  // Highest single matrix answer → Complaining x Think.
  assert.strictEqual(r.hc, 0);
  assert.strictEqual(r.hd, 0);
});

test('compute: catch point is internal when think+feel >= choose+do', () => {
  const internal = zeros();
  internal[mIdx(0, 0)] = internal[mIdx(0, 1)] = 3; // think+feel weighted
  L.setAns(internal); L.compute();
  assert.strictEqual(L.getRes().cp, 'internal');

  const external = zeros();
  for (let c = 0; c < 4; c++) { external[mIdx(c, 2)] = 3; external[mIdx(c, 3)] = 3; } // choose+do
  L.setAns(external); L.compute();
  assert.strictEqual(L.getRes().cp, 'external');
});

test('compute: return score sums the 8 Return items and maps to a band (0–24)', () => {
  const ri = retIdxs();
  const bands = [
    [0, 0, 'weak'],         // all 0  → 0
    [1, 8, 'emerging'],     // all 1  → 8
    [2, 16, 'strengthening'], // all 2 → 16
    [3, 24, 'practiced'],   // all 3  → 24
  ];
  for (const [fill, expScore, expBand] of bands) {
    const a = zeros();
    ri.forEach((i) => { a[i] = fill; });
    L.setAns(a); L.compute();
    const r = L.getRes();
    assert.strictEqual(r.rS, expScore, `return score for fill=${fill}`);
    assert.strictEqual(r.rL, expBand, `return band for fill=${fill}`);
  }
});

test('compute: the two closing items are not scored (wellbeing routing + context)', () => {
  const a = zeros();
  a[kindIdx('wellbeing')] = 3; // "A lot"
  a[kindIdx('context')] = 0;   // first option
  L.setAns(a); L.compute();
  const r = L.getRes();
  assert.strictEqual(r.cS.reduce((x, y) => x + y, 0), 0, 'C scores unaffected by closing items');
  assert.strictEqual(r.dS.reduce((x, y) => x + y, 0), 0, 'domain scores unaffected');
  assert.strictEqual(r.rS, 0, 'return score unaffected');
  assert.strictEqual(r.wb, 3, 'wellbeing answer captured for routing');
  assert.ok(typeof r.ctx === 'string' && r.ctx.length > 0, 'context captured for personalization');
});

test('compute: practice is keyed to the vulnerable domain', () => {
  const a = zeros();
  for (let d = 0; d < 4; d++) a[mIdx(0, d)] = 3; // dd → Think
  L.setAns(a); L.compute();
  const r = L.getRes();
  assert.ok(L.PR[L.DI[r.dd]], 'a practice exists for the vulnerable domain');
  assert.strictEqual(L.PR[L.DI[r.dd]].n, L.PR.think.n);
});

/* ── /api/ghl payload validation for PDF/report delivery ────────────── */
test('validate: accepts a complete PDF report delivery payload', () => {
  assert.strictEqual(validate({
    contact: { name: 'Sam', email: 'a@b.co', phone: '+254700000000' },
    segmentation: { ageRange: '35-44', gender: 'Male', source: 'Instagram' }
  }), null);
});

test('validate: requires the participant details needed for PDF delivery', () => {
  assert.match(validate({ contact: { name: 'Sam' }, segmentation: {} }), /email is required/);
  assert.match(validate({ contact: { name: 'Sam', email: 'a@b.co' }, segmentation: {} }), /phone/);
  assert.match(validate({ contact: { name: 'Sam', email: 'a@b.co', phone: '+254700000000' }, segmentation: { gender: 'Male', source: 'Instagram' } }), /ageRange/);
  assert.match(validate({ contact: { name: 'Sam', email: 'a@b.co', phone: '+254700000000' }, segmentation: { ageRange: '35-44', source: 'Instagram' } }), /gender/);
  assert.match(validate({ contact: { name: 'Sam', email: 'a@b.co', phone: '+254700000000' }, segmentation: { ageRange: '35-44', gender: 'Male' } }), /source/);
});

test('validate: rejects missing/empty/oversized name, bad email, non-objects', () => {
  assert.strictEqual(typeof validate({}), 'string');
  assert.strictEqual(typeof validate({ contact: { name: '   ' } }), 'string');
  assert.strictEqual(typeof validate({ contact: { name: 'x'.repeat(201) } }), 'string');
  assert.strictEqual(typeof validate({ contact: { name: 'Sam', email: 'nope' } }), 'string');
  assert.strictEqual(typeof validate(null), 'string');
});
