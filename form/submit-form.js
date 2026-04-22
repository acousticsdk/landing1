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

function closeFormThanks() {
  var root = document.getElementById("form-thanks");
  if (!root) return;
  root.classList.remove("is-open");
  root.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function openFormThanks() {
  var root = document.getElementById("form-thanks");
  if (!root) {
    root = document.createElement("div");
    root.id = "form-thanks";
    root.className = "form-thanks";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "form-thanks-title");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML =
      '<div class="form-thanks__dialog">' +
      '<p id="form-thanks-title" class="form-thanks__title font-cine">' +
      '<span class="form-thanks__title-accent">Спасибо</span> за заявку' +
      "</p>" +
      '<p class="form-thanks__text font-sf">Мы свяжемся с вами в ближайшее время.</p>' +
      '<button type="button" class="form-thanks__btn font-sf" data-form-thanks-close>OK</button>' +
      "</div>";
    document.body.appendChild(root);

    root.addEventListener("click", function (e) {
      if (e.target === root) closeFormThanks();
    });
    root
      .querySelector("[data-form-thanks-close]")
      .addEventListener("click", closeFormThanks);
  }

  document.body.style.overflow = "hidden";
  root.setAttribute("aria-hidden", "false");
  requestAnimationFrame(function () {
    root.classList.add("is-open");
    var btn = root.querySelector("[data-form-thanks-close]");
    if (btn) btn.focus();
  });
}

document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  var root = document.getElementById("form-thanks");
  if (root && root.classList.contains("is-open")) {
    e.preventDefault();
    closeFormThanks();
  }
});

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
      form.reset();
      openFormThanks();
    } catch (err) {
      console.error(err);
      alert("Не удалось отправить заявку. Попробуйте позже.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("form-submit--pending");
      }
    }
  });
})();
