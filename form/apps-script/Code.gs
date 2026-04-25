/**
 * Опційно: сповіщення в Telegram.
 * У редакторі Apps Script: Project Settings → Script properties
 *   TELEGRAM_BOT_TOKEN — токен бота
 *   TELEGRAM_CHAT_ID — id чату / каналу
 * Якщо властивостей немає — рядок у таблицю пишеться як раніше, у Telegram нічого не йде.
 *
 * Рядок про програму в повідомленні без лапок навколо (не "хочу…", а хочу…).
 */
var PROGRAM_LEAD_LINE = "хочу на програму x100";

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var p = e.parameter || {};
    sheet.appendRow([
      p.name || "",
      p.phone || "",
      p.telegram || "",
      new Date(),
    ]);
    notifyTelegramIfConfigured_(p);
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("OK");
}

function notifyTelegramIfConfigured_(p) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty("TELEGRAM_BOT_TOKEN");
  var chatId = props.getProperty("TELEGRAM_CHAT_ID");
  if (!token || !chatId) return;

  var text = [
    "Нова заявка з форми",
    "",
    PROGRAM_LEAD_LINE,
    "",
    "Ім'я: " + (p.name || ""),
    "Телефон: " + (p.phone || ""),
    "Telegram: " + (p.telegram || ""),
  ].join("\n");

  var url = "https://api.telegram.org/bot" + token + "/sendMessage";
  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json; charset=utf-8",
    payload: JSON.stringify({
      chat_id: chatId,
      text: text,
      disable_web_page_preview: true,
    }),
    muteHttpExceptions: true,
  });
}
