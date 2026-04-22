/**
 * Привяжите проект к таблице: Расширения → Apps Script из меню таблицы.
 * Первая строка листа — заголовки: Имя | Телефон | Telegram | Дата
 *
 * Развернуть → Веб-приложение:
 * - Запускать от имени: я (владелец)
 * - Кто имеет доступ: все, в т.ч. анонимные (иначе с сайта будет 403)
 */
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
