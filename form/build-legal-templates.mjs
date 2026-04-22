/**
 * Генерує два <template id="legal-doc-oferta|policy"> з oferta.txt / policy.txt
 * для вставки в index.html перед <script src="submit-form.js">.
 *
 * Запуск з каталогу landings/form:
 *   node build-legal-templates.mjs > legal-templates.generated.html
 * Потім вставити вміст згенерованого файлу в index.html (один раз) або через скрипт деплою.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linkify(s) {
  return s.replace(/(https?:\/\/[^\s<)",]+)(,)?/g, function (_, url, comma) {
    var clean = url.replace(/[.;:!?)]+$/g, "");
    var trail = comma || "";
    return (
      `<a href="${esc(clean)}" target="_blank" rel="noopener noreferrer">${esc(clean)}</a>` +
      trail
    );
  });
}

function lineToHtml(s) {
  return linkify(esc(s));
}

/**
 * Перші непорожні рядки до першого порожнього — «шапка» (.legal-doc__lead).
 */
function txtToArticle(raw) {
  const lines = raw.replace(/^\uFEFF/, "").split(/\r?\n/);
  let html = '<article class="legal-doc" lang="uk">';
  let inUl = false;
  let idx = 0;
  let inPreamble = true;

  function closeUl() {
    if (inUl) {
      html += "</ul>";
      inUl = false;
    }
  }

  while (idx < lines.length) {
    const line = lines[idx];
    const t = line.trim();

    if (!t) {
      closeUl();
      if (inPreamble) {
        inPreamble = false;
      }
      idx++;
      continue;
    }

    const isBullet =
      /^(?:•|\u2022|\u00B7)\s*/.test(t) ||
      (/^[-*]\s+/.test(t) && t.length > 2);

    if (isBullet) {
      if (inPreamble) {
        inPreamble = false;
      }
      const item = t.replace(/^(?:•|\u2022|\u00B7)\s*/, "").replace(/^[-*]\s+/, "");
      if (!inUl) {
        html += '<ul class="legal-doc__list">';
        inUl = true;
      }
      html += `<li>${lineToHtml(item)}</li>`;
      idx++;
      continue;
    }

    closeUl();

    if (inPreamble) {
      html += `<p class="legal-doc__lead">${lineToHtml(t)}</p>`;
      idx++;
      continue;
    }

    if (/^\d+\.\d+\./.test(t)) {
      const m = t.match(/^(\d+\.\d+\.\s*)([\s\S]*)$/);
      if (m) {
        html += `<p class="legal-doc__p"><strong>${lineToHtml(m[1].trim())}</strong> ${lineToHtml(m[2].trim())}</p>`;
      } else {
        html += `<p class="legal-doc__p">${lineToHtml(t)}</p>`;
      }
      idx++;
      continue;
    }

    if (/^\d+\.\s/.test(t)) {
      html += `<h3 class="legal-doc__section">${lineToHtml(t)}</h3>`;
      idx++;
      continue;
    }

    html += `<p class="legal-doc__p">${lineToHtml(t)}</p>`;
    idx++;
  }

  closeUl();
  html += "</article>";
  return html;
}

function wrapTemplate(id, inner) {
  return `<template id="${id}">\n${inner}\n</template>`;
}

const ofertaPath = path.join(__dirname, "oferta.txt");
const policyPath = path.join(__dirname, "policy.txt");
const oferta = fs.readFileSync(ofertaPath, "utf8");
const policy = fs.readFileSync(policyPath, "utf8");

const out =
  wrapTemplate("legal-doc-oferta", txtToArticle(oferta)) +
  "\n\n" +
  wrapTemplate("legal-doc-policy", txtToArticle(policy));

process.stdout.write(out + "\n");
