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
 *
 * ------------------------------------------------------------------
 * OPTIONAL: real-time order alerts into the shop's LINE group
 * (LINE Notify was discontinued Mar 2025 — this uses LINE Messaging API)
 *
 * 1. Go to https://developers.line.biz → create a Messaging API channel
 *    (attach it to the shop's LINE Official Account).
 * 2. In the channel's "Messaging API" tab → issue a long-lived
 *    **Channel access token** → paste it into LINE_CHANNEL_TOKEN below.
 * 3. Same tab → set **Webhook URL** to this script's /exec URL and
 *    enable "Use webhook".
 * 4. Invite the bot into the shop's LINE group (or DM it) and send any
 *    message — the script captures the group automatically and replies
 *    "✅ เชื่อมต่อแล้ว". From then on every order pings that group.
 *
 * Free plan quota: ~300 push messages/month (replies are free).
 * Leave LINE_CHANNEL_TOKEN = '' to keep this feature off.
 * ------------------------------------------------------------------
 */

var LINE_CHANNEL_TOKEN = ''; // '' = LINE alerts off

var HEADERS = ['Time', 'Ref', 'Channel', 'Name', 'Phone', 'Room/Table', 'Pickup', 'Total (฿)', 'Note', 'Items', 'Lang'];

function doPost(e) {
  try {
    var data = {};
    try { data = JSON.parse(e.postData.contents); } catch (_) { data = (e && e.parameter) || {}; }

    // LINE webhook events (bot invited / messaged) → capture the target chat id.
    if (data && data.events) return handleLineWebhook_(data);

    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    ensureHeaders_(sh);

    var row = [
      data.at || new Date().toISOString(),
      data.ref || '',
      data.channel || '',
      data.name || '',
      data.phone || '',
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

    if (!updated) notifyLine_(data); // ping the shop group on new orders only

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

/* ---------------- LINE Messaging API helpers ---------------- */

// Remembers where to send alerts (group/room/user that talked to the bot).
function handleLineWebhook_(data) {
  try {
    var events = data.events || [];
    for (var i = 0; i < events.length; i++) {
      var src = events[i].source || {};
      var target = src.groupId || src.roomId || src.userId;
      if (target) {
        PropertiesService.getScriptProperties().setProperty('LINE_TARGET', target);
        if (events[i].replyToken && LINE_CHANNEL_TOKEN) {
          lineApi_('https://api.line.me/v2/bot/message/reply', {
            replyToken: events[i].replyToken,
            messages: [{ type: 'text', text: '✅ เชื่อมต่อแจ้งเตือนออเดอร์แล้ว — ออเดอร์ใหม่จะเด้งที่นี่' }]
          });
        }
        break;
      }
    }
  } catch (err) {}
  return json_({ ok: true });
}

function notifyLine_(data) {
  try {
    if (!LINE_CHANNEL_TOKEN) return;
    var target = PropertiesService.getScriptProperties().getProperty('LINE_TARGET');
    if (!target) return;
    var lines = [
      '🍛 ออเดอร์ใหม่ ' + (data.ref || ''),
      '👤 ' + (data.name || '-') + (data.phone ? ' · 📞 ' + data.phone : ''),
      '🏠 ' + (data.room || '-') + ' · ⏰ ' + (data.time || 'เร็วที่สุด'),
      '💰 ฿' + (data.total || 0) + ' (' + (data.channel || '') + ')'
    ];
    if (data.note) lines.push('📝 ' + data.note);
    if (data.items) lines.push('——————', String(data.items).slice(0, 900));
    lineApi_('https://api.line.me/v2/bot/message/push', {
      to: target,
      messages: [{ type: 'text', text: lines.join('\n') }]
    });
  } catch (err) {}
}

function lineApi_(url, payload) {
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + LINE_CHANNEL_TOKEN },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}
