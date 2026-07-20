// generate-pages.mjs
// Vygeneruje statické HTML súbory pre každý článok a stránku,
// aby mal každý vlastnú kanonickú URL, správne OG meta tagy
// A predrenderovaný obsah v <main id="app"> — Facebook/scrapery
// nespúšťajú JavaScript, čítajú len HTML zo servera.
// script.js po načítaní obsah prekreslí (výsledné HTML je identické).
//
// Spustenie:  node scripts/generate-pages.mjs [výstupný_adresár]
// Bez argumentu generuje do koreňa repa (vedľa index.html).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(process.argv[2] ?? ROOT);
const SITE = "https://dogtrekking.sk";
const DEFAULT_IMAGE = `${SITE}/img/dogtrekking_sk_preview.webp`;

const template = readFileSync(join(ROOT, "index.html"), "utf-8");
const articles = JSON.parse(readFileSync(join(ROOT, "data", "articles.json"), "utf-8"));
const pages = JSON.parse(readFileSync(join(ROOT, "data", "pages.json"), "utf-8"));
const events = JSON.parse(readFileSync(join(ROOT, "data", "events.json"), "utf-8"));

// --- pomocné funkcie ---------------------------------------------------

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const stripHtml = (s) => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

// Vytiahne popis z tela článku/stránky: prvý textový odsek, max ~160 znakov
function extractDescription(body) {
  const segments = body.split("\n\n").map((s) => s.trim());
  for (const seg of segments) {
    if (!seg || seg === "[IMAGE_INSERT]") continue;
    const text = stripHtml(seg);
    if (text.length < 30) continue; // preskoč nadpisy a krátke útržky
    return text.length > 160 ? text.slice(0, 157).trimEnd() + "…" : text;
  }
  return "Kalendár akcií, články a všetko, čo o dogtrekkingu potrebujete vedieť.";
}

const absoluteUrl = (path) => (path.startsWith("http") ? path : SITE + (path.startsWith("/") ? path : "/" + path));

// V predrenderovanom HTML používame relatívne cesty — web beží na koreni
// domény (dogtrekking.sk) aj pod podcestou (matusmarcin.github.io/<repo>/)
// a všetky stránky sú na najvyššej úrovni, takže relatívna cesta platí všade.
const relativeUrl = (path) => (path.startsWith("http") ? path : path.replace(/^\//, ""));

function buildSeoBlock({ title, description, image, url, type }) {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  return `<!-- SEO:START -->
    <title>${t} | Dogtrekking.sk</title>
    <link rel="canonical" href="${url}">
    <meta name="description" content="${d}">
    <meta property="og:title" content="${t}">
    <meta property="og:description" content="${d}">
    <meta property="og:image" content="${image}">
    <meta property="og:url" content="${url}">
    <meta property="og:type" content="${type}">
    <meta property="og:site_name" content="Dogtrekking.sk">
    <meta name="twitter:card" content="summary_large_image">
    <!-- SEO:END -->`;
}

// --- predrenderovanie obsahu (rovnaké HTML ako generuje script.js) -----

function renderArticleBody(article) {
  return article.body.split("\n\n").map((segment) => {
    const trimmed = segment.trim();
    if (trimmed === "[IMAGE_INSERT]") {
      return `<img src="${relativeUrl(article.image)}" alt="Náhľad" class="article-img">`;
    }
    if (trimmed.startsWith("<")) {
      return trimmed;
    }
    return `<p>${trimmed}</p>`;
  }).join("");
}

function sidebarHTML() {
  const featuredArticles = articles.filter((a) => a.isFeatured === true);
  return `
        <h3>Vybrané články</h3>
        ${featuredArticles.map((a) => `
            <a href="${a.id}" onclick="showPage('${a.id}'); return false;">${a.title}</a>
        `).join("")}

        <div style="text-align: center; margin-top: 20px;">
            <a href="kalendar" class="btn-yellow" onclick="showPage('kalendar'); return false;">Kalendár akcií</a>
        </div>

        <div class="social-links" style="margin-top: 30px; text-align: center;">
        <p style="font-weight: bold; margin-bottom: 5px;">Sleduj nás na Facebooku</p>
        <a href="https://www.facebook.com/dogtrekking.sk" target="_blank" class="fb-link">Stránka</a>
        <a href="https://www.facebook.com/groups/95459999453" target="_blank" class="fb-link">Skupina</a>
    </div>`;
}

function articlePageContent(bodyHTML, title) {
  return `
        <div class="article-page-wrapper">
            <article class="article-content">
                <h1>${title}</h1>
                ${bodyHTML}
                <a href="./" class="btn-yellow btn-back-nav" onclick="showPage('home'); return false;">← Späť</a>
            </article>
            <aside class="sidebar">${sidebarHTML()}</aside>
        </div>`;
}

function kalendarContent() {
  const grouped = events.reduce((acc, event) => {
    (acc[event.month] = acc[event.month] || []).push(event);
    return acc;
  }, {});

  let html = `<h2>Kalendár akcií</h2>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Krajina</th>
                            <th>Dátum</th>
                            <th>Názov</th>
                            <th class="desktop-only">Miesto</th>
                            <th>Typ</th>
                            <th class="desktop-only">Info</th>
                        </tr>
                    </thead>
                    <tbody>`;

  for (const month in grouped) {
    html += `<tr><td colspan="6" style="background:#f4f4f4; font-weight:bold;">${month}</td></tr>`;
    html += grouped[month].map((e) => {
      const jeSlovensko = e.country === "SK" ? "sk-event" : "";
      const typy = e.type.split(",").map((t) => t.trim());
      const badgeHTML = typy.map((t) => {
        let colorClass = "";
        if (t === "DT") colorClass = "badge-dt";
        else if (t === "CC") colorClass = "badge-cc";
        else if (t === "DM") colorClass = "badge-dm";
        return `<span class="badge ${colorClass}">${t}</span>`;
      }).join(" ");

      return `
                    <tr class="${jeSlovensko}" onclick="window.open('${e.url}', '_blank')" style="cursor:pointer;">
                        <td><img src="https://flagcdn.com/24x18/${e.country.toLowerCase()}.png" alt="${e.country}"></td>
                        <td>${e.date}</td>
                        <td style="font-weight: bold;">${e.name}</td>
                        <td class="desktop-only">${e.location}</td>
                        <td>${badgeHTML}</td>
                        <td class="desktop-only"><a href="${e.url}" target="_blank" class="btn-link">Viac info</a></td>
                    </tr>`;
    }).join("");
  }
  html += `</tbody></table></div>`;
  return html;
}

function homeContent() {
  const articlesPerPage = 3;
  const totalPages = Math.ceil(articles.length / articlesPerPage);
  const cards = articles.slice(0, articlesPerPage).map((a) => `
        <a href="${a.id}" class="card-link" onclick="showPage('${a.id}'); return false;">
            <div class="card" style="background-image: url('${relativeUrl(a.image)}');">
                <h3>${a.title}</h3>
            </div>
        </a>`).join("");

  return `
                <section class="hero">
                    <div class="hero-text">
                        <h1 class="hero-title">Dogtrekking</h1>
                        <h2 class="hero-subtitle">Slovensko</h2>
                        <p>Dogtrekking je extrémny vytrvalostný šport človeka a psa, pri ktorom sa prekonávajú vzdialenosti okolo 100 kilometrov v danom časovom limite. Neľakajte sa – dogtrekking je v skutočnosti turistika so psom. Teda aspoň poväčšinou.</p>
                        <div class="hero-buttons">
                            <a href="o-dogtrekkingu" onclick="showPage('o-dogtrekkingu'); return false;" class="btn-white">O dogtrekkingu</a>
                            <a href="kalendar" onclick="showPage('kalendar'); return false;" class="btn-yellow">Kalendár akcií</a>
                        </div>
                    </div>
                    <div class="hero-image"><img src="img/dogtrekking_background_home_02.webp" alt="Dogtrekking background"></div>
                </section>
                <div class="articles-grid" id="articles-list">${cards}
    <div class="pagination">
        <button onclick="changePage(-1)" disabled>&lt;</button>
        <span class="page-info">1 / ${totalPages}</span>
        <button onclick="changePage(1)" ${totalPages <= 1 ? "disabled" : ""}>&gt;</button>
    </div></div>`;
}

// --- skladanie výsledného HTML -----------------------------------------

const seoRegex = /<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/;
const contentRegex = /<!-- CONTENT:START -->[\s\S]*?<!-- CONTENT:END -->/;
if (!seoRegex.test(template)) {
  throw new Error("V index.html chýbajú značky <!-- SEO:START --> / <!-- SEO:END -->");
}
if (!contentRegex.test(template)) {
  throw new Error("V index.html chýbajú značky <!-- CONTENT:START --> / <!-- CONTENT:END -->");
}

function renderPage(meta, content) {
  return template
    .replace(seoRegex, buildSeoBlock(meta))
    .replace(contentRegex, () => `<!-- CONTENT:START -->${content}<!-- CONTENT:END -->`);
}

function writePage(id, meta, content) {
  const html = renderPage(meta, content);
  const outPath = join(OUT, `${id}.html`);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, "utf-8");
  console.log(`✓ ${id}.html  —  ${meta.title}`);
}

// --- generovanie -------------------------------------------------------

const generated = [];

for (const a of articles) {
  writePage(a.id, {
    title: a.title,
    description: extractDescription(a.body ?? ""),
    image: a.image ? absoluteUrl(a.image) : DEFAULT_IMAGE,
    url: `${SITE}/${a.id}`,
    type: "article",
  }, articlePageContent(renderArticleBody(a), a.title));
  generated.push(a.id);
}

for (const p of pages) {
  writePage(p.id, {
    title: p.title,
    description: extractDescription(p.body ?? ""),
    image: p.image ? absoluteUrl(p.image) : DEFAULT_IMAGE,
    url: `${SITE}/${p.id}`,
    type: "website",
  }, articlePageContent(p.body ?? "", p.title));
  generated.push(p.id);
}

// Kalendár nie je v pages.json — je to sekcia priamo v script.js
writePage("kalendar", {
  title: "Kalendár akcií",
  description: "Kalendár dogtrekkingových akcií na Slovensku a v okolitých krajinách — dátumy, miesta a odkazy na prihlasovanie.",
  image: DEFAULT_IMAGE,
  url: `${SITE}/kalendar`,
  type: "website",
}, kalendarContent());
generated.push("kalendar");

// Domovská stránka — predrenderovaný hero + zoznam článkov do index.html.
// SEO blok ostáva pôvodný z template (kanonická URL na koreň webu).
{
  const html = template.replace(contentRegex, () => `<!-- CONTENT:START -->${homeContent()}<!-- CONTENT:END -->`);
  writeFileSync(join(OUT, "index.html"), html, "utf-8");
  console.log("✓ index.html  —  domovská stránka");
}

// --- sitemap.xml (bonus pre Google) ------------------------------------

const urls = ["", ...generated].map(
  (id) => `  <url><loc>${SITE}/${id}</loc></url>`
);
writeFileSync(
  join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`,
  "utf-8"
);
console.log(`✓ sitemap.xml (${urls.length} URL)`);
console.log(`\nHotovo — vygenerovaných ${generated.length + 1} stránok.`);
