/**
 * 4C Reflex Screen — Google Sheets sink, PDF report generator, and Resend email delivery.
 *
 * Required Script Properties:
 *   RESEND_API_KEY     Resend API key used for transactional delivery.
 * Optional Script Properties:
 *   SHEET_ID           Existing Google Sheet id. If absent, the script creates one.
 *   REPORT_FOLDER_ID   Existing Drive folder for PDF reports. If absent, the script creates one.
 *   FROM_EMAIL         Verified Resend sender, e.g. House of Mastery <results@houseofmastery.co>.
 *   BCC_EMAIL          Defaults to mail@mogire.com.
 */

const SHEET_ID = ''; // Optional hard-coded Sheet id; otherwise Script Properties are used.
const SHEET_NAME = 'Leads';
const DEFAULT_FROM_EMAIL = 'House of Mastery <results@houseofmastery.co>';
const DEFAULT_BCC_EMAIL = 'mail@mogire.com';

const HEADERS = [
  'timestamp', 'name', 'email', 'phone',
  'country', 'city', 'gender', 'ageRange', 'profession', 'source', 'readiness',
  'consentWhatsApp', 'consentEmail',
  'dominantC', 'secondaryC', 'vulnerableDomain', 'hotZone', 'catchPoint',
  'returnCapacity', 'returnScore', 'practice',
  'complainScore', 'criticizeScore', 'compareScore', 'competeScore',
  'thinkScore', 'feelScore', 'chooseScore', 'doScore',
  'alcarraScores', 'pdfReportUrl', 'resendEmailId',
  'answers', 'event'
];

const ALCARRA = [
  ['Awareness', 'I am willing to see myself as I really am.', 'Name the truth I have been avoiding, out loud or on paper, before I explain it away.', 'The thing I least wanted to admit is written down, undefended.'],
  ['Learning', 'I am willing to begin again.', 'When I break a commitment, I restart the same day at the smallest viable step. No waiting for Monday, no restarting from zero.', 'The record shows a same-day return after a slip, not a multi-day gap. The restart was one step, not a relaunch.'],
  ['Change', 'I am willing to change how I see myself.', 'When I catch an old self-label running, I say it out loud, then state in present tense what I am holding instead.', 'I can name the specific label I put down this week and the one I carry now.'],
  ['Action', 'I am willing to start before I feel ready.', 'When I notice I am gathering more information to delay, I take the first irreversible step within the hour. Send it, call it, publish it.', 'Something exists tonight that did not exist this morning, started before I felt ready.'],
  ['Resilience', 'I am willing to persist through difficulty.', 'On the hard day I do the minimum non-negotiable version instead of skipping. Reduce scope, never the streak.', 'The difficult days show a smaller entry, not a missing one. I continued at thirty percent rather than quitting at zero.'],
  ['Reflection', 'I am willing to look back without defending.', 'In the weekly review I write what I got wrong and stop before the “because.” State the miss, drop the justification.', 'The review holds plain admissions with no defense attached.'],
  ['Accountability', 'I will not lead myself by myself.', 'I keep one person with standing to question me, and I bring them the thing I most want to hide before they have to ask.', 'Someone other than me knows my current commitment and my last failure. I disclosed it; they did not have to extract it.']
];

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    validateRequired_(d);

    const report = createPdfReport_(d);
    d.assessment = d.assessment || {};
    d.assessment.pdfReportUrl = report.downloadUrl;

    const emailResult = sendCleanResultEmail_(d, report.downloadUrl);
    d.assessment.resendEmailId = emailResult && emailResult.id ? emailResult.id : '';

    appendSubmission_(d);
    return json_({ ok: true, pdfReportUrl: report.downloadUrl, resendEmailId: d.assessment.resendEmailId });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet() {
  return json_({ ok: true, service: '4c-reflex-screen', time: new Date().toISOString() });
}

function validateRequired_(d) {
  const c = d.contact || {}, s = d.segmentation || {};
  const missing = [];
  if (!String(c.name || '').trim()) missing.push('full name');
  if (!String(c.email || '').trim()) missing.push('email');
  if (!String(c.phone || '').trim()) missing.push('phone');
  if (!String(s.ageRange || '').trim()) missing.push('age range');
  if (!String(s.gender || '').trim()) missing.push('gender');
  if (!String(s.source || '').trim()) missing.push('how you heard about this program');
  if (missing.length) throw new Error('Missing required fields for PDF report: ' + missing.join(', '));
}

function appendSubmission_(d) {
  const c = d.contact || {}, s = d.segmentation || {}, a = d.assessment || {}, m = d.meta || {};
  const sh = sheet_();
  ensureHeaders_(sh);
  sh.appendRow([
    m.timestamp || new Date().toISOString(),
    c.name || '', c.email || '', c.phone || '',
    s.country || '', s.city || '', s.gender || '', s.ageRange || '', s.profession || '', s.source || '', s.readiness || '',
    s.consentWhatsApp || '', s.consentEmail || '',
    a.dominantC || '', a.secondaryC || '', a.vulnerableDomain || '', a.hotZone || '', a.catchPoint || '',
    a.returnCapacity || '', a.returnScore || '', a.practice || '',
    a.complainScore || '', a.criticizeScore || '', a.compareScore || '', a.competeScore || '',
    a.thinkScore || '', a.feelScore || '', a.chooseScore || '', a.doScore || '',
    a.alcarraScores || '', a.pdfReportUrl || '', a.resendEmailId || '',
    a.answers || '', d.event || ''
  ]);
}

function createPdfReport_(d) {
  const c = d.contact || {}, s = d.segmentation || {}, a = d.assessment || {}, m = d.meta || {};
  const folder = reportFolder_();
  const safeName = sanitizeFile_(c.name || 'Participant');
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Africa/Nairobi', 'yyyy-MM-dd HHmm');
  const doc = DocumentApp.create('4C Reflex Screen Report — ' + safeName + ' — ' + stamp);
  const docFile = DriveApp.getFileById(doc.getId());
  folder.addFile(docFile);
  try { DriveApp.getRootFolder().removeFile(docFile); } catch (err) {}

  const body = doc.getBody();
  body.clear();
  applyBodyStyle_(body);

  addTitle_(body, '4C Reflex Screen Report');
  addMuted_(body, 'Prepared for ' + (c.name || 'Participant') + ' · ' + (m.timestamp || new Date().toISOString()));
  addParagraph_(body, 'This report translates your 4C Reflex Screen into practical language. It does not diagnose you. It names where your attention, emotion, choice, and action may leak under pressure, then gives you a return path you can practice.');

  addSection_(body, '1. Your 4C pattern');
  addKeyValue_(body, 'Dominant reflex', a.dominantC || 'Not available');
  addKeyValue_(body, 'Secondary reflex', a.secondaryC || 'Not available');
  addKeyValue_(body, 'Most vulnerable domain', a.vulnerableDomain || 'Not available');
  addKeyValue_(body, 'Hot zone', a.hotZone || 'Not available');
  addKeyValue_(body, 'Catch point', a.catchPoint || 'Not available');
  addParagraph_(body, 'Your dominant reflex is the pattern most likely to appear first when you feel pressure, exposure, delay, correction, or comparison. It is not your identity. It is the route by which personal power leaves your hands before you consciously choose your next step.');
  addParagraph_(body, 'Your secondary reflex matters because it often protects the first one. If the dominant reflex is the doorway, the secondary reflex is the hallway that keeps you inside the pattern. Progress begins when you can name both without defending either.');

  addSection_(body, '2. The four leaks in practical language');
  addParagraph_(body, 'Complain leaks power by moving attention toward what is unfair, delayed, missing, or outside your control. Criticize leaks power by creating distance through judgment. Compare leaks power by measuring your life against another person’s chapter. Compete leaks power when winning, proving, or being seen becomes more important than obedience to the right next step.');
  addScoreLine_(body, 'Complain', a.complainScore, 15);
  addScoreLine_(body, 'Criticize', a.criticizeScore, 15);
  addScoreLine_(body, 'Compare', a.compareScore, 15);
  addScoreLine_(body, 'Compete', a.competeScore, 15);

  addSection_(body, '3. Where the pattern begins');
  addParagraph_(body, 'The screen also looks at where the reflex tends to begin: what you think, what you feel, what you choose, or what you do. This is important because the first visible behavior is rarely the true starting point. The earlier you catch the pattern, the less force it has by the time it becomes action.');
  addScoreLine_(body, 'Think', a.thinkScore, 12);
  addScoreLine_(body, 'Feel', a.feelScore, 12);
  addScoreLine_(body, 'Choose', a.chooseScore, 12);
  addScoreLine_(body, 'Do', a.doScore, 12);

  addSection_(body, '4. Your return capacity');
  addKeyValue_(body, 'Return capacity', a.returnCapacity || 'Not available');
  addKeyValue_(body, 'Return score', a.returnScore || 'Not available');
  addKeyValue_(body, 'Recommended practice', a.practice || 'Not available');
  addParagraph_(body, 'Return capacity is the ability to come back to your lane after you notice that you have left it. It is not the same as perfection. In the House of Mastery frame, maturity is not proven by never leaking power; it is proven by noticing sooner, telling the truth faster, and returning with less drama.');
  addParagraph_(body, practiceDescription_(a.practice));

  addSection_(body, '5. The ALCARRA commitments');
  addParagraph_(body, 'ALCARRA is the commitment ladder that turns insight into practice: Awareness, Learning, Change, Action, Resilience, Reflection, and Accountability. Your ALCARRA scores are inferred from your 4C answers and return pattern. They should be read as practice signals, not labels.');
  const scores = parseAlcarra_(a.alcarraScores);
  ALCARRA.forEach((row) => {
    const name = row[0];
    const score = scores[name] ? scores[name].score + '/100 · ' + scores[name].level : 'practice signal';
    addSubhead_(body, name + ' — ' + score);
    addParagraph_(body, 'Promise: ' + row[1]);
    addParagraph_(body, 'Practice: ' + row[2]);
    addParagraph_(body, 'Evidence: ' + row[3]);
  });

  addSection_(body, '6. Seven-day integration');
  addParagraph_(body, 'For the next seven days, do not try to fix every pattern at once. Choose the one practice attached to your report and repeat it daily. Each evening, write three plain lines: where the reflex appeared, what it cost, and how you returned. If you miss a day, use ALCARRA Learning: restart the same day at the smallest viable step.');
  addParagraph_(body, 'The aim is not to become impressive. The aim is to become honest, available, and responsible with your own attention. That is where mastery begins.');

  addMuted_(body, 'This screen is a self-reflection and growth tool. It is not medical, psychiatric, psychological, legal, financial, or spiritual diagnosis or treatment.');

  doc.saveAndClose();

  const pdfBlob = docFile.getAs(MimeType.PDF).setName('4C Reflex Screen Report — ' + safeName + '.pdf');
  const pdfFile = folder.createFile(pdfBlob);
  pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  try { docFile.setTrashed(true); } catch (err) {}

  return {
    fileId: pdfFile.getId(),
    viewUrl: pdfFile.getUrl(),
    downloadUrl: 'https://drive.google.com/uc?export=download&id=' + pdfFile.getId()
  };
}

function sendCleanResultEmail_(d, pdfUrl) {
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty('RESEND_API_KEY');
  if (!apiKey) throw new Error('RESEND_API_KEY is not set in Script Properties.');

  const c = d.contact || {}, a = d.assessment || {};
  const to = String(c.email || '').trim();
  if (!to) throw new Error('Missing recipient email.');

  const firstName = String(c.name || 'there').trim().split(/\s+/)[0];
  const bccEmail = props.getProperty('BCC_EMAIL') || DEFAULT_BCC_EMAIL;
  const fromEmail = props.getProperty('FROM_EMAIL') || DEFAULT_FROM_EMAIL;
  const subject = 'Your 4C Reflex Screen PDF report';

  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#102844;background:#ffffff;padding:0;margin:0;">' +
    '<p>Hi ' + esc_(firstName) + ',</p>' +
    '<p>Thank you for completing the 4C Reflex Screen.</p>' +
    '<p>Your PDF report is ready. You can download it here:</p>' +
    '<p><a href="' + escAttr_(pdfUrl) + '" style="color:#163558;font-weight:700;">Download your 4C Reflex Screen PDF report</a></p>' +
    '<p>Your on-screen results show the core pattern. The PDF gives you the fuller report, including your 4C profile, return practice, and ALCARRA commitments.</p>' +
    '<p>With respect,<br>House of Mastery</p>' +
    '</div>';

  const text =
    'Hi ' + firstName + ',\n\n' +
    'Thank you for completing the 4C Reflex Screen.\n\n' +
    'Your PDF report is ready. Download it here:\n' + pdfUrl + '\n\n' +
    'Your on-screen results show the core pattern. The PDF gives you the fuller report, including your 4C profile, return practice, and ALCARRA commitments.\n\n' +
    'With respect,\nHouse of Mastery';

  const payload = {
    from: fromEmail,
    to: [to],
    bcc: [bccEmail],
    subject: subject,
    html: html,
    text: text
  };

  const response = UrlFetchApp.fetch('https://api.resend.com/emails', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + apiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  const body = response.getContentText();
  if (code < 200 || code >= 300) throw new Error('Resend email failed: HTTP ' + code + ' — ' + body);
  try { return JSON.parse(body); } catch (err) { return { raw: body }; }
}

function sheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = SHEET_ID || props.getProperty('SHEET_ID');
  let ss;
  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create('4C Reflex Screen — Submissions');
    props.setProperty('SHEET_ID', ss.getId());
    Logger.log('Created spreadsheet: ' + ss.getUrl());
  }
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function ensureHeaders_(sh) {
  const current = sh.getLastRow() ? sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), HEADERS.length)).getValues()[0] : [];
  if (!current[0]) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    return;
  }
  const needsUpdate = HEADERS.some((h, i) => current[i] !== h);
  if (needsUpdate) sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
}

function reportFolder_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('REPORT_FOLDER_ID');
  if (id) return DriveApp.getFolderById(id);
  const folder = DriveApp.createFolder('4C Reflex Screen PDF Reports');
  props.setProperty('REPORT_FOLDER_ID', folder.getId());
  return folder;
}

function applyBodyStyle_(body) {
  body.setMarginTop(54).setMarginBottom(54).setMarginLeft(54).setMarginRight(54);
}

function addTitle_(body, text) {
  const p = body.appendParagraph(text);
  p.setHeading(DocumentApp.ParagraphHeading.TITLE).setForegroundColor('#102844').setBold(true);
}

function addSection_(body, text) {
  body.appendParagraph('');
  const p = body.appendParagraph(text);
  p.setHeading(DocumentApp.ParagraphHeading.HEADING1).setForegroundColor('#102844').setBold(true);
}

function addSubhead_(body, text) {
  const p = body.appendParagraph(text);
  p.setHeading(DocumentApp.ParagraphHeading.HEADING2).setForegroundColor('#163558').setBold(true);
}

function addParagraph_(body, text) {
  const p = body.appendParagraph(String(text || ''));
  p.setFontFamily('Arial').setFontSize(11).setLineSpacing(1.25).setForegroundColor('#102844');
}

function addMuted_(body, text) {
  const p = body.appendParagraph(String(text || ''));
  p.setFontFamily('Arial').setFontSize(9).setLineSpacing(1.15).setForegroundColor('#40546B');
}

function addKeyValue_(body, key, value) {
  const p = body.appendParagraph(key + ': ' + value);
  p.setFontFamily('Arial').setFontSize(11).setForegroundColor('#102844');
  p.editAsText().setBold(0, key.length, true);
}

function addScoreLine_(body, key, value, max) {
  const label = value === '' || value === undefined || value === null ? 'not available' : value + '/' + max;
  addKeyValue_(body, key, label);
}

function practiceDescription_(practice) {
  const p = String(practice || '').toLowerCase();
  if (p.indexOf('power question') >= 0) return 'Practice the power question by asking, “Is this mine to carry, or is this a leak?” If the matter belongs to you, act responsibly. If it belongs to someone else’s perception, release it.';
  if (p.indexOf('feeling') >= 0 || p.indexOf('name') >= 0) return 'Practice naming the feeling before explaining it. One honest word reduces the charge and gives you space to choose your response.';
  if (p.indexOf('return') >= 0) return 'Practice the return question: “What is the next faithful choice that actually belongs to me?” This moves you from reaction into responsibility.';
  if (p.indexOf('pause') >= 0 || p.indexOf('60') >= 0) return 'Practice the 60-second pause. You are not suppressing the urge; you are observing it long enough to stop confusing urgency with truth.';
  return 'Practice returning to the next faithful action. Small, repeatable obedience matters more than dramatic relaunches.';
}

function parseAlcarra_(raw) {
  const out = {};
  String(raw || '').split('|').forEach((part) => {
    const bits = part.split(':');
    if (bits.length >= 2) out[bits[0]] = { score: bits[1], level: bits[2] || '' };
  });
  return out;
}

function sanitizeFile_(name) {
  return String(name || 'Participant').replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 90) || 'Participant';
}

function esc_(s) {
  return String(s || '').replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
}

function escAttr_(s) {
  return esc_(s).replace(/"/g, '&quot;');
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
