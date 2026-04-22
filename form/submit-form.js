/**
 * Заявки в Google Таблицу через «Развернуть» → веб-приложение Apps Script.
 *
 * Настройка (кратко):
 * 1) Новая Google Таблица → строка 1: Имя | Телефон | Telegram | Дата
 * 2) Таблица → Расширения → Apps Script → вставьте код из apps-script/Code.gs
 * 3) Развернуть → Новое развертывание → тип «Веб-приложение»
 *    — выполнять от вашего имени, доступ: «У всех»
 * 4) Скопируйте URL веб-приложения и вставьте ниже в FORM_ENDPOINT.
 */
const FORM_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzeF40KMHBTIhPMsgK_9kZ7JnhERZMjOlDI6s6_0CpIGg5JZmPOJ0MUgmxhpkzElku2/exec";

/** Після успішної відправки заявки — оплата броню (WayForPay). */
const PAYMENT_REDIRECT_URL =
  "https://secure.wayforpay.com/button/b5e68f38574dd";

(function () {
  const form = document.querySelector(".form-block");
  if (!form) return;

  form.querySelectorAll(".form-input").forEach(function (input) {
    input.addEventListener("input", function () {
      input.classList.remove("form-input--invalid");
    });
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!FORM_ENDPOINT) {
      console.warn(
        "[form] Укажите URL веб-приложения в submit-form.js → FORM_ENDPOINT"
      );
      alert("Форма ещё не подключена к таблице. Обратитесь к администратору.");
      return;
    }

    form.querySelectorAll(".form-input").forEach(function (el) {
      el.classList.remove("form-input--invalid");
    });

    const fd = new FormData(form);
    const name = (fd.get("name") || "").toString().trim();
    const phone = (fd.get("phone") || "").toString().trim();
    const telegram = (fd.get("telegram") || "").toString().trim();

    var nameOk = !!name;
    var phoneOk = !!phone;
    var telegramOk = !!telegram;
    if (!nameOk) {
      var nameEl = form.querySelector('[name="name"]');
      if (nameEl) nameEl.classList.add("form-input--invalid");
    }
    if (!phoneOk) {
      var phoneEl = form.querySelector('[name="phone"]');
      if (phoneEl) phoneEl.classList.add("form-input--invalid");
    }
    if (!telegramOk) {
      var tgEl = form.querySelector('[name="telegram"]');
      if (tgEl) tgEl.classList.add("form-input--invalid");
    }
    if (!nameOk || !phoneOk || !telegramOk) {
      var firstBad = form.querySelector(".form-input--invalid");
      if (firstBad) firstBad.focus();
      return;
    }

    const submitBtn = form.querySelector(".form-submit");
    const body = new URLSearchParams({ name, phone, telegram });

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add("form-submit--pending");
    }

    try {
      await fetch(FORM_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
      });
      window.location.assign(PAYMENT_REDIRECT_URL);
    } catch (err) {
      console.error(err);
      alert("Не удалось отправить заявку. Попробуйте позже.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("form-submit--pending");
      }
    }
  });
})();
