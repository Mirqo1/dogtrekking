// Hlavná funkcia pre zobrazenie obsahu
async function showPage(page, updateHistory = true) {
    const app = document.getElementById('app');
    
    // Vyčistenie názvu stránky
    const target = (page === '/' || page === '' || page === 'home') ? 'home' : page.replace('/', '');

    // Ak chceme meniť URL v prehliadači (pri kliknutí na odkaz)
    if (updateHistory) {
        history.pushState({page: target}, "", `/${target === 'home' ? '' : target}`);
    }

    // Zobrazenie indikátora načítania
    app.innerHTML = "Načítavam...";

    try {
// ... vo vnútri showPage funkcie, sekcia 'home'
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
        <h2 style="text-align:center;">Posledné články</h2>
        <div class="articles-grid" id="articles-list">Načítavam...</div>`;
    
    // ZAVOLÁME NAČÍTANIE ČLÁNKOV TU
    loadArticles(); 
}
            
            const res = await fetch('data/articles.json');
            const data = await res.json();
            document.getElementById('articles-list').innerHTML = data.map(a => 
                `<div class="card"><h3>${a.title}</h3><p>${a.body}</p></div>`).join('');

        } else if (target === 'calendar') {
            const res = await fetch('data/events.json');
            const data = await res.json();
            
            const grouped = data.reduce((acc, event) => {
                (acc[event.month] = acc[event.month] || []).push(event);
                return acc;
            }, {});

            let html = `<h2>Kalendár akcií</h2>`;
for (const month in grouped) {
    html += `<h3>${month}</h3><table><tbody>` 
    + grouped[month].map(e => `
        <tr>
            <td><img src="https://flagcdn.com/24x18/${e.country.toLowerCase()}.png" alt="${e.country}"></td>
            <td>${e.date}</td>
            <td style="text-align: center; font-weight: bold;">${e.name}</td> <!-- Zmenené na center -->
            <td>${e.location}</td>
            <td><a href="${e.url}" target="_blank" class="btn-link">Viac info</a></td>
        </tr>
    `).join('') + `</tbody></table>`;
}
app.innerHTML = html;

        } else if (target === 'about') {
            app.innerHTML = `<h2>Čo je Dogtrekking</h2><p style="text-align:center;">Dogtrekking je vytrvalostný kynologický šport.</p>`;
        }
    } catch (e) {
        app.innerHTML = "Chyba pri načítaní obsahu.";
    }
}

// Počúvač pre tlačidlá Späť a Vpred v prehliadači
window.addEventListener('popstate', (event) => {
    const page = event.state ? event.state.page : 'home';
    showPage(page, false);
});

// Inicializácia pri prvom načítaní stránky
const initialPage = window.location.pathname.replace('/', '') || 'home';
showPage(initialPage, false);

let currentPage = 0;
const articlesPerPage = 3;
let allArticles = [];

async function loadArticles() {
    const res = await fetch('data/articles.json');
    allArticles = await res.json();
    renderArticles();
}

// Táto funkcia už existuje v tvojom kóde, len ju uprav takto:
window.changePage = function(direction) {
    currentPage += direction;
    renderArticles();
};

function renderArticles() {
    const container = document.getElementById('articles-list');
    if (!container) return; // Ochrana, ak nie sme na home

    const start = currentPage * articlesPerPage;
    const end = start + articlesPerPage;
    const paginatedItems = allArticles.slice(start, end);

    container.innerHTML = paginatedItems.map(a => 
        `<div class="card"><h3>${a.title}</h3><p>${a.body}</p></div>`
    ).join('') + `
    <div class="pagination">
        <button onclick="changePage(-1)" ${currentPage === 0 ? 'disabled' : ''}>← Staršie</button>
        <button onclick="changePage(1)" ${(end >= allArticles.length) ? 'disabled' : ''}>Novšie →</button>
    </div>`;
}

function changePage(direction) {
    currentPage += direction;
    renderArticles();
}
