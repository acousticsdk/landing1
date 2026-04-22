/**
 * Заявки в Google Таблицу через веб-приложение Apps Script.
 *
 * Если в консоли 403:
 * 1) Развернуть → Управление развертываниями → «Изменить» (карандаш)
 * 2) «Кто имеет доступ» → «Все», в т.ч. анонимные пользователи (Anyone / All)
 * 3) «Запускать от имени» → владелец таблицы (Me)
 * 4) Сохранить НОВОЕ развертывание и подставить новый URL /exec в FORM_ENDPOINT
 * 5) Один раз открыть URL /exec в браузере под аккаунтом Google и подтвердить права
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
      setTimeout(cleanup, 300);
    });
    setTimeout(cleanup, 10000);

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

  var help403 =
    "\n\nЕсли ошибка 403: в Google Apps Script откройте развёртывание веб-приложения и выставьте доступ «У всех» (включая анонимных), затем создайте новое развертывание и обновите ссылку в submit-form.js.";

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
      var res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        mode: "cors",
        cache: "no-store",
        body: body,
      });

      if (res.ok) {
        form.reset();
        alert("Спасибо! Заявка отправлена.");
        return;
      }

      var hint = res.status === 403 ? help403 : "";
      alert(
        "Сервер отклонил заявку (код " + res.status + ")." + hint
      );
    } catch (err) {
      console.warn("[form] fetch не удался, пробуем отправку через iframe", err);
      try {
        await postViaHiddenIframe(FORM_ENDPOINT, body);
        form.reset();
        alert(
          "Заявка отправлена. Если строка не появилась в таблице в течение минуты, проверьте доступ к веб-приложению (не должно быть 403 в консоли)." +
            help403
        );
      } catch (err2) {
        console.error(err2);
        alert(
          "Не удалось отправить заявку. Проверьте интернет и настройки Google Apps Script." +
            help403
        );
      }
    }
  });
})();
