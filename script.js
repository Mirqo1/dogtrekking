async function showPage(page, updateHistory = true) {
    const app = document.getElementById('app');
    let target = page.startsWith('/') ? page.substring(1) : page;
    if (target === '' || target === 'home') target = 'home';

    // Tu voláme novú funkciu, ak nájdeme článok
    const article = allArticles.find(a => a.id === target);
    if (article) {
        if (updateHistory) history.pushState({page: target}, "", `/${target}`);
        showArticle(target); // Voláme tvoju novú funkciu
        return;
    }

    if (updateHistory) {
        history.pushState({page: target}, "", `/${target === 'home' ? '' : target}`);
    }

    app.innerHTML = "Načítavam...";
    try {
        if (target === 'home') {
            app.innerHTML = `
                <section class="hero">
                    <div class="hero-text">
                        <h1 class="hero-title">Dogtrekking</h1>
                        <h2 class="hero-subtitle">Slovensko</h2>
                        <p>Dogtrekking je extrémny vytrvalostný šport človeka a psa, pri ktorom sa prekonávajú vzdialenosti okolo 100 kilometrov v danom časovom limite. Neľakajte sa – dogtrekking je v skutočnosti turistika so psom. Teda aspoň poväčšinou.</p>
                        <div class="hero-buttons">
                            <a href="/o-dogtrekkingu" onclick="showPage('o-dogtrekkingu'); return false;" class="btn-white">O dogtrekkingu</a>
                            <a href="/kalendar" onclick="showPage('kalendar'); return false;" class="btn-yellow">Kalendár akcií</a>
                        </div>
                    </div>
                    <div class="hero-image"><img src="/img/dogtrekking_background_home_02.webp" alt="Dogtrekking background"></div>
                </section>
                <div class="articles-grid" id="articles-list">Načítavam články...</div>`;
            
            if (allArticles.length === 0) await loadArticles();
            else renderArticles();

        } else if (target === 'kalendar') {
            const res = await fetch('data/events.json');
            const data = await res.json();
            const grouped = data.reduce((acc, event) => {
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
                // ... vo vnútri mapovania dát ...
html += grouped[month].map(e => {
    // Tu kontrolujeme, či je krajina SK, ak áno, priradíme triedu 'sk-event'
    const jeSlovensko = e.country === 'SK' ? 'sk-event' : '';
    
    return `
    <tr class="${jeSlovensko}" onclick="window.open('${e.url}', '_blank')" style="cursor:pointer;">
        <td><img src="https://flagcdn.com/24x18/${e.country.toLowerCase()}.png" alt="${e.country}"></td>
        <td>${e.date}</td>
        <td style="font-weight: bold;">${e.name}</td>
        
        <!-- Tu je trik: Stĺpce Miesto a Info pridáme iba ak nie je mobil -->
        <td class="desktop-only">${e.location}</td>
        
        <td><span class="badge">${e.type}</span></td>
        
        <td class="desktop-only"><a href="${e.url}" target="_blank" class="btn-link">Viac info</a></td>
    </tr>`;
}).join('');
            }
            html += `</tbody></table></div>`;
            app.innerHTML = html;
        } else {
            app.innerHTML = `<h2>Čo je Dogtrekking</h2><p style="text-align:center;">Dogtrekking je vytrvalostný kynologický šport.</p>`;
        }
    } catch (e) {
        console.error("Chyba:", e);
        app.innerHTML = "Chyba pri načítaní obsahu.";
    }
}

let currentPage = 0;
const articlesPerPage = 2;
let allArticles = [];

async function loadArticles() {
    try {
        const res = await fetch('data/articles.json');
        allArticles = await res.json();
        renderArticles();
    } catch (e) {
        const list = document.getElementById('articles-list');
        if (list) list.innerHTML = "Nepodarilo sa načítať články.";
    }
}

function filterArticles() {
    const searchBar = document.getElementById('search-bar');
    if (!searchBar) return;
    
    const searchTerm = searchBar.value.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
    
    const container = document.getElementById('articles-list');
    
    // Ak je pole prázdne, vrátime pôvodné zobrazenie stránkovania
    if (searchTerm === "") {
        renderArticles();
        return;
    }

    const filtered = allArticles.filter(a => {
        const titleNormalized = a.title.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return titleNormalized.includes(searchTerm);
    });

    // Zobrazenie výsledkov vyhľadávania (bez pagination)
    container.innerHTML = filtered.map(a => `
        <a href="/${a.id}" class="card-link" onclick="showPage('${a.id}'); return false;">
            <div class="card" style="background-image: url('${a.image}');">
                <h3>${a.title}</h3>
            </div>
        </a>`
    ).join('');
}

window.changePage = function(direction) {
    currentPage += direction;
    const newPath = (currentPage === 0) ? '/' : `/page-${currentPage + 1}`;
    history.pushState({page: 'home', pageNum: currentPage + 1}, "", newPath);
    renderArticles();
};

function renderArticles() {
    const container = document.getElementById('articles-list');
    if (!container) return;

    const totalPages = Math.ceil(allArticles.length / 2);
    const start = currentPage * 2;
    const paginatedItems = allArticles.slice(start, start + 2);

    let contentHTML = "";
    paginatedItems.forEach(a => {
        contentHTML += `
        <a href="/${a.id}" class="card-link" onclick="showPage('${a.id}'); return false;">
            <div class="card" style="background-image: url('${a.image}');">
                <h3>${a.title}</h3>
            </div>
        </a>`;
    });

    if (paginatedItems.length > 0) {
        contentHTML += `
        <div class="card ad-slot">
            <h3>Reklamný priestor</h3>
        </div>`;
    }

    container.innerHTML = contentHTML + `
    <div class="pagination">
        <button onclick="changePage(-1)" ${currentPage === 0 ? 'disabled' : ''}>&lt;</button>
        <span class="page-info">${currentPage + 1} / ${totalPages}</span>
        <button onclick="changePage(1)" ${(currentPage + 1 >= totalPages) ? 'disabled' : ''}>&gt;</button>
    </div>`;
}

async function startApp() {
    await loadArticles();
    const path = window.location.pathname.substring(1); 
    
    if (path.startsWith('page-')) {
        currentPage = parseInt(path.replace('page-', '')) - 1;
        showPage('home', false);
    } else {
        showPage(path || 'home', false);
    }
}

startApp();

window.addEventListener('popstate', (event) => {
    const path = window.location.pathname.substring(1);
    if (!path || path === 'home') {
        showPage('home', false);
    } else if (path.startsWith('page-')) {
        currentPage = parseInt(path.replace('page-', '')) - 1;
        showPage('home', false);
    } else {
        showPage(path, false);
    }
});

function showArticle(id) {
    const article = allArticles.find(a => a.id === id);
    if (!article) return;
    
    // Filtrovanie len vybraných článkov
    const featuredArticles = allArticles.filter(a => a.isFeatured === true);

    let bodyHTML = article.body.split('\n\n').map(segment => {
        if (segment.trim() === "[IMAGE_INSERT]") {
            return `<img src="${article.image}" style="width:100%; margin: 20px 0; border-radius: 8px;">`;
        }
        return `<p>${segment}</p>`;
    }).join('');

    document.getElementById('app').innerHTML = `
        <div class="article-page-wrapper">
            <article class="article-content">
                <h1>${article.title}</h1>
                ${bodyHTML}
                <a href="/" class="btn-back" onclick="showPage('home'); return false;">← Späť na zoznam</a>
            </article>
            
            <aside class="sidebar">
                <h3>Vybrané články</h3>
                ${featuredArticles.map(a => `
                    <a href="#" onclick="showPage('${a.id}'); return false;">${a.title}</a>
                `).join('')}
                
                <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
                
                <a href="#" class="btn-calendar" onclick="showPage('kalendar'); return false;">Kalendár akcií</a>
            </aside>
        </div>`;
}
