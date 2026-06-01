/**
 * 4C Personal Task Assessment — Google Sheets lead capture.
 *
 * Paste this whole file into your Apps Script project (replacing Code.gs),
 * then Deploy ▸ New deployment ▸ Web app:
 *   • Execute as:      Me
 *   • Who has access:  Anyone
 * Copy the resulting Web app URL (ends in /exec) into index.html → GAS_URL,
 * and (optionally) into the GHL CRM nowhere — this sink is independent.
 *
 * Receives the same JSON the site posts to /api/ghl and appends one row per
 * completed assessment. If SHEET_ID is left blank, the script creates a
 * spreadsheet on first run and remembers its id in Script Properties (the id
 * is written to the execution log so you can find/open it).
 */

const SHEET_ID = '';          // optional: paste an existing Google Sheet id here
const SHEET_NAME = 'Leads';

const HEADERS = [
  'timestamp', 'name', 'email', 'phone',
  'country', 'city', 'gender', 'ageRange', 'profession', 'source', 'readiness',
  'consentWhatsApp', 'consentEmail',
  'dominantC', 'secondaryC', 'vulnerableDomain', 'hotZone', 'catchPoint',
  'returnCapacity', 'returnScore', 'practice',
  'complainScore', 'criticizeScore', 'compareScore', 'competeScore',
  'thinkScore', 'feelScore', 'chooseScore', 'doScore',
  'answers', 'event'
];

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const c = d.contact || {}, s = d.segmentation || {}, a = d.assessment || {}, m = d.meta || {};
    const sh = sheet_();
    if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
    sh.appendRow([
      m.timestamp || new Date().toISOString(),
      c.name || '', c.email || '', c.phone || '',
      s.country || '', s.city || '', s.gender || '', s.ageRange || '', s.profession || '', s.source || '', s.readiness || '',
      s.consentWhatsApp || '', s.consentEmail || '',
      a.dominantC || '', a.secondaryC || '', a.vulnerableDomain || '', a.hotZone || '', a.catchPoint || '',
      a.returnCapacity || '', a.returnScore || '', a.practice || '',
      a.complainScore || '', a.criticizeScore || '', a.compareScore || '', a.competeScore || '',
      a.thinkScore || '', a.feelScore || '', a.chooseScore || '', a.doScore || '',
      a.answers || '', d.event || ''
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Health check: open the /exec URL in a browser to confirm the deployment.
function doGet() {
  return json_({ ok: true, service: '4c-personal-task', time: new Date().toISOString() });
}

function sheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = SHEET_ID || props.getProperty('SHEET_ID');
  let ss;
  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create('4C Personal Task Assessment — Leads');
    props.setProperty('SHEET_ID', ss.getId());
    Logger.log('Created spreadsheet: ' + ss.getUrl());
  }
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function json_(o) {
  return ContentService
    .createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
