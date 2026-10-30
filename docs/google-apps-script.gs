/**
 * Google Sheets booking back-end for the salon template.
 *
 * SETUP (5 minutes, free):
 *  1. Create a Google Sheet. Extensions → Apps Script. Delete the sample code, paste this file.
 *  2. Change SECRET below to a long random string. Put the same value in GOOGLE_SHEETS_SECRET.
 *  3. Deploy → New deployment → type "Web app".
 *       Execute as: Me    ·    Who has access: Anyone
 *  4. Copy the Web app URL into GOOGLE_SHEETS_WEBAPP_URL and set BOOKING_PROVIDER=google-sheets.
 *  5. After editing this script later: Deploy → Manage deployments → Edit → Version: New.
 *
 * To cancel a booking, type "cancelled" in its Status cell — the slot frees up automatically.
 */

const SECRET = "change-me-to-a-long-random-string";
const SHEET_NAME = "Bookings";
const HEADERS = [
  "Reference", "Created", "Date", "Time", "Name", "Phone", "Services",
  "Duration (min)", "Estimated total", "Notes", "Status", "Summary",
];
const COL = { date: 3, time: 4, status: 11 }; // 1-based column numbers in HEADERS

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    // Keep dates/times as plain text so Sheets doesn't reformat them.
    sheet.getRange("C:D").setNumberFormat("@");
  }
  return sheet;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

/** { "HH:mm": count } for active bookings on `date`. */
function countsFor_(date) {
  const rows = sheet_().getDataRange().getValues().slice(1);
  const counts = {};
  rows.forEach(function (r) {
    const status = String(r[COL.status - 1]).toLowerCase();
    if (String(r[COL.date - 1]) !== date || status === "cancelled") return;
    const time = String(r[COL.time - 1]);
    counts[time] = (counts[time] || 0) + 1;
  });
  return counts;
}

/** GET ?action=counts&date=YYYY-MM-DD&secret=… → { ok, counts } */
function doGet(e) {
  const p = e.parameter || {};
  if (p.secret !== SECRET) return json_({ ok: false, error: "unauthorized" });
  if (p.action === "counts" && /^\d{4}-\d{2}-\d{2}$/.test(p.date || "")) {
    return json_({ ok: true, counts: countsFor_(p.date) });
  }
  return json_({ ok: false, error: "bad_request" });
}

/** POST { action: "create", secret, maxPerSlot, booking } → { ok } | { ok: false, error: "slot_full" } */
function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: "bad_json" });
  }
  if (body.secret !== SECRET) return json_({ ok: false, error: "unauthorized" });
  if (body.action !== "create" || !body.booking) return json_({ ok: false, error: "bad_request" });

  // The lock makes "check count, then append" atomic, so the last seat can't be sold twice.
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const b = body.booking;
    const taken = countsFor_(b.date)[b.time] || 0;
    if (body.maxPerSlot && taken >= body.maxPerSlot) return json_({ ok: false, error: "slot_full" });

    sheet_().appendRow([
      b.id, b.createdAt, b.date, b.time, b.name, b.phone, b.services,
      b.totalMinutes, b.totalPrice, b.notes || "", "new", b.summary,
    ]);
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}
