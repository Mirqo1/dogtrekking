# dogtrekking.sk

Single-page web hostovaný na GitHub Pages. Obsah (články, stránky, kalendár) je v `data/*.json`.

## Zdieľanie na Facebooku / kanonické URL

Facebook a iné scrapery nespúšťajú JavaScript — čítajú len HTML zo servera. Preto
`scripts/generate-pages.mjs` vygeneruje pre každý článok a stránku vlastný HTML súbor
(napr. `beh-a-dogtrekking.html`) so správnymi `<meta og:...>` tagmi, kanonickou URL
a predrenderovaným obsahom priamo v HTML (medzi značkami `<!-- CONTENT:START/END -->`
v `<main id="app">`). Stránka tak má obsah aj bez JavaScriptu; `script.js` ju po
načítaní prekreslí na rovnaké HTML. GitHub Pages potom servuje
`https://dogtrekking.sk/beh-a-dogtrekking` priamo z tohto súboru.

Pozn.: pri lokálnom teste otváraj vygenerované súbory cez lokálny server
(napr. `python3 -m http.server`), nie cez `file://` — cesty k CSS/JS sú absolútne
(`/style.css`), takže pri otvorení súboru priamo z disku sa štýly nenačítajú.

Generovanie beží automaticky cez GitHub Actions (`.github/workflows/deploy.yml`)
pri každom pushi do `main` — vygenerované súbory sa do repa necommitujú, idú len do deployu.

## Jednorazové nastavenie (dôležité!)

V repozitári: **Settings → Pages → Build and deployment → Source** prepni na **GitHub Actions**
(namiesto "Deploy from a branch"). Bez toho workflow nenasadí nič.

## Pridanie nového článku

1. Pridaj záznam do `data/articles.json` (id = URL slug, image = náhľadový obrázok).
2. Commit + push do `main`.
3. Hotovo — workflow vygeneruje HTML aj sitemap sám.

Lokálny test generátora: `node scripts/generate-pages.mjs /tmp/vystup`
