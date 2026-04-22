/**
 * Модалки «Договір-оферта» та «Політика конфіденційності» — HTML з <template> у index.html
 * (згенеровано з oferta.txt / policy.txt: node build-legal-templates.mjs).
 */
(function () {
  var MAP = {
    oferta: { tpl: "legal-doc-oferta", title: "Договір публічної оферти" },
    policy: { tpl: "legal-doc-policy", title: "Політика конфіденційності" },
  };

  function closeLegalModal() {
    var el = document.getElementById("legal-doc-modal");
    if (!el) return;
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function getModal() {
    var el = document.getElementById("legal-doc-modal");
    if (el) return el;
    el = document.createElement("div");
    el.id = "legal-doc-modal";
    el.className = "legal-modal";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<div class="legal-modal__dialog">' +
      '<div class="legal-modal__head">' +
      '<h2 class="legal-modal__title font-sf js-legal-modal-title"></h2>' +
      "</div>" +
      '<div class="legal-modal__body font-sf js-legal-modal-body"></div>' +
      '<div class="legal-modal__foot">' +
      '<button type="button" class="legal-modal__btn font-sf" data-legal-modal-close>OK</button>' +
      "</div>" +
      "</div>";
    document.body.appendChild(el);

    el.addEventListener("click", function (e) {
      if (e.target === el) closeLegalModal();
    });
    el.querySelector("[data-legal-modal-close]").addEventListener("click", closeLegalModal);
    return el;
  }

  function setBodyError(bodyEl, msg) {
    bodyEl.innerHTML =
      '<p class="legal-modal__err font-sf" role="alert">' +
      (msg || "Не вдалося показати документ.") +
      "</p>";
  }

  function openLegalModal(key) {
    var cfg = MAP[key];
    if (!cfg) return;

    var tpl = document.getElementById(cfg.tpl);
    var el = getModal();
    var titleEl = el.querySelector(".js-legal-modal-title");
    var bodyEl = el.querySelector(".js-legal-modal-body");

    titleEl.textContent = cfg.title;
    bodyEl.innerHTML = "";

    if (!tpl) {
      setBodyError(bodyEl, "Шаблон документа не знайдено. Оновіть сторінку або зверніться до адміністратора.");
    } else {
      bodyEl.appendChild(tpl.content.cloneNode(true));
    }

    document.body.style.overflow = "hidden";
    el.setAttribute("aria-hidden", "false");
    requestAnimationFrame(function () {
      el.classList.add("is-open");
      el.querySelector("[data-legal-modal-close]").focus();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var m = document.getElementById("legal-doc-modal");
    if (m && m.classList.contains("is-open")) {
      e.preventDefault();
      closeLegalModal();
    }
  });

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-legal-doc]");
    if (!btn) return;
    var key = btn.getAttribute("data-legal-doc");
    if (!MAP[key]) return;
    e.preventDefault();
    openLegalModal(key);
  });
})();
