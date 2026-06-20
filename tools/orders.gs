/**
 * House of Happiness Kitchen — order logger (Google Apps Script Web App)
 * ---------------------------------------------------------------------
 * Receives order POSTs from the website (CONFIG.orderWebhook) and writes
 * each order as a row in this Google Sheet. Re-sending the same order
 * (e.g. WhatsApp then LINE) updates the same row instead of duplicating.
 *
 * SETUP (one time, ~3 minutes)
 * 1. Create a new Google Sheet (sheets.new).
 * 2. Extensions → Apps Script. Delete the sample code, paste THIS file, Save.
 * 3. Deploy → New deployment → (gear) Web app
 *      - Description: orders
 *      - Execute as:  Me
 *      - Who has access: Anyone
 *    → Deploy → Authorize (allow access to your account).
 * 4. Copy the Web app URL (it ends with /exec).
 * 5. In index.html, set:  CONFIG.orderWebhook = 'PASTE_THE_/exec_URL_HERE'
 *    (then commit/push). Done — new orders land in the sheet automatically.
 *
 * Test: open the /exec URL in a browser — it should reply {"ok":true,...}.
 */

var HEADERS = ['Time', 'Ref', 'Channel', 'Name', 'Room/Table', 'Pickup', 'Total (฿)', 'Note', 'Items', 'Lang'];

function doPost(e) {
  try {
    var data = {};
    try { data = JSON.parse(e.postData.contents); } catch (_) { data = (e && e.parameter) || {}; }

    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    ensureHeaders_(sh);

    var row = [
      data.at || new Date().toISOString(),
      data.ref || '',
      data.channel || '',
      data.name || '',
      data.room || '',
      data.time || '',
      data.total || '',
      data.note || '',
      data.items || '',
      data.lang || ''
    ];

    // De-dupe by Ref: update the existing row if this order was already logged.
    var ref = ('' + row[1]).trim();
    var updated = false;
    if (ref && sh.getLastRow() > 1) {
      var refs = sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < refs.length; i++) {
        if (('' + refs[i][0]).trim() === ref) {
          sh.getRange(i + 2, 1, 1, row.length).setValues([row]);
          updated = true;
          break;
        }
      }
    }
    if (!updated) sh.appendRow(row);

    return json_({ ok: true, updated: updated });
  } catch (err) {
    return json_({ ok: false, error: '' + err });
  }
}

function doGet() {
  return json_({ ok: true, service: 'House of Happiness Kitchen order logger' });
}

function ensureHeaders_(sh) {
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
