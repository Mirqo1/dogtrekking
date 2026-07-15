async function showPage(page, updateHistory = true) {
    const app = document.getElementById('app');
    let target = page.startsWith('/') ? page.substring(1) : page;
    if (target === '' || target === 'home') target = 'home';

    // 1. SKÚSIME NÁJSŤ ČLÁNOK (podľa ID)
    const article = allArticles.find(a => a.id === target);
    if (article) {
        if (updateHistory) history.pushState({page: target}, "", `/${target}`);
        app.innerHTML = `
            <article class="article-detail">
                <h1>${article.title}</h1>
                <p><em>${article.date}</em></p>
                <div class="article-body">${article.body}</div>
                <br>
                <a href="/" onclick="showPage('home'); return false;">← Späť na zoznam</a>
            </article>`;
        return;
    }

    // 2. OSTATNÝ OBSAH
    if (updateHistory) {
        history.pushState({page: target}, "", `/${target === 'home' ? '' : target}`);
    }

    app.innerHTML = "Načítavam...";
    try {
        if (target === 'home') {
            app.innerHTML = `
                <section class="hero">
                    <div class="hero-text">
                        <h1>Dogtrekking</h1>
                        <p><strong>Slovensko</strong></p>
                        <p>Dogtrekking je vytrvalostný kynologický šport...</p>
                        <div class="hero-buttons">
                            <a href="/about" onclick="showPage('about'); return false;" class="btn-white">O dogtrekkingu</a>
                            <a href="/calendar" onclick="showPage('calendar'); return false;" class="btn-yellow">Kalendár akcií</a>
                        </div>
                    </div>
                    <div class="hero-image"><img src="img/dogtrekking-hero.jpg" alt="Dogtrekking"></div>
                </section>
                <div class="articles-grid" id="articles-list">Načítavam články...</div>`;
            
            if (allArticles.length === 0) await loadArticles();
            else renderArticles();

        } else if (target === 'calendar') {
            const res = await fetch('data/events.json');
            const data = await res.json();
            const grouped = data.reduce((acc, event) => {
                (acc[event.month] = acc[event.month] || []).push(event);
                return acc;
            }, {});
            let html = `<h2>Kalendár akcií</h2>`;
            for (const month in grouped) {
                html += `<h3>${month}</h3><table><tbody>` + grouped[month].map(e => `
                    <tr>
                        <td><img src="https://flagcdn.com/24x18/${e.country.toLowerCase()}.png" alt="${e.country}"></td>
                        <td>${e.date}</td>
                        <td style="text-align: center; font-weight: bold;">${e.name}</td>
                        <td>${e.location}</td>
                        <td><a href="${e.url}" target="_blank" class="btn-link">Viac info</a></td>
                    </tr>`).join('') + `</tbody></table>`;
            }
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
const articlesPerPage = 3;
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

window.changePage = function(direction) {
    currentPage += direction;
    const newPath = (currentPage === 0) ? '/' : `/page-${currentPage + 1}`;
    history.pushState({page: 'home', pageNum: currentPage + 1}, "", newPath);
    renderArticles();
};

function renderArticles() {
    const container = document.getElementById('articles-list');
    if (!container) return;

    const totalPages = Math.ceil(allArticles.length / articlesPerPage);
    const start = currentPage * articlesPerPage;
    const paginatedItems = allArticles.slice(start, start + articlesPerPage);

    container.innerHTML = paginatedItems.map(a => `
        <a href="/${a.id}" class="card-link" onclick="showPage('${a.id}'); return false;">
            <div class="card" style="background-image: url('${a.image}');">
                <h3>${a.title}</h3>
            </div>
        </a>`
    ).join('') + `
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
