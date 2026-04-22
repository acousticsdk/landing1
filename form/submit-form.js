/**
 * Заявки в Google Таблицу через веб-приложение Apps Script.
 *
 * Важно: у веб-приложения Google нет заголовка Access-Control-Allow-Origin для
 * произвольных сайтов — fetch() с вашего домена даёт CORS-ошибку даже при 200.
 * Поэтому отправка только через обычный POST в скрытый iframe (без XHR/fetch).
 *
 * Если в Network по-прежнему 403:
 * — Развернуть → Управление развертываниями → доступ «Все», в т.ч. анонимные
 * — Запускать от имени: владелец таблицы
 * — Новое развертывание и актуальный URL /exec в FORM_ENDPOINT
 */
const FORM_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyJBmfoqcciWjJH2uCGOPiliHr7DEnGV41n_TNsVO_4kKLRiFni5yGpD5MwGdBM-SBP/exec";

function postViaHiddenIframe(actionUrl, params) {
  return new Promise(function (resolve, reject) {
    var iframeName = "gs-sheet-" + Date.now();
    var iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:absolute;width:0;height:0;border:0;clip:rect(0,0,0,0)";
    document.body.appendChild(iframe);

    var form = document.createElement("form");
    form.method = "POST";
    form.action = actionUrl;
    form.target = iframeName;
    form.acceptCharset = "UTF-8";

    params.forEach(function (value, key) {
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);

    var cleaned = false;
    function cleanup() {
      if (cleaned) return;
      cleaned = true;
      form.remove();
      iframe.remove();
      resolve();
    }

    iframe.addEventListener("load", function () {
      setTimeout(cleanup, 400);
    });
    setTimeout(cleanup, 12000);

    try {
      form.submit();
    } catch (err) {
      cleanup();
      reject(err);
    }
  });
}

(function () {
  var form = document.querySelector(".form-block");
  if (!form) return;

  var afterSend =
    "Проверьте таблицу через минуту. Если строки нет, в консоли часто бывает 403 — тогда в Apps Script для веб-приложения включите доступ «У всех» (включая анонимных) и сделайте новое развертывание.";

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!FORM_ENDPOINT) {
      console.warn(
        "[form] Укажите URL веб-приложения в submit-form.js → FORM_ENDPOINT"
      );
      alert("Форма ещё не подключена к таблице. Обратитесь к администратору.");
      return;
    }

    var fd = new FormData(form);
    var name = (fd.get("name") || "").toString().trim();
    var phone = (fd.get("phone") || "").toString().trim();
    var telegram = (fd.get("telegram") || "").toString().trim();

    if (!name || !phone) {
      alert("Укажите имя и номер телефона.");
      return;
    }

    var body = new URLSearchParams({ name: name, phone: phone, telegram: telegram });

    try {
      await postViaHiddenIframe(FORM_ENDPOINT, body);
      form.reset();
      alert("Спасибо! Заявка отправлена.\n\n" + afterSend);
    } catch (err) {
      console.error(err);
      alert(
        "Не удалось отправить форму. Проверьте подключение к интернету.\n\n" +
          afterSend
      );
    }
  });
})();
