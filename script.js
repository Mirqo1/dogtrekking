async function showPage(page, updateHistory = true) {
    const app = document.getElementById('app');
    const target = (page === '/' || page === '' || page === 'home') ? 'home' : page.replace('/', '');

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
                <h2 style="text-align:center;">Posledné články</h2>
                <div class="articles-grid" id="articles-list">Načítavam články...</div>`;
            
            // Načítame a hneď vykreslíme
            await loadArticles(); 

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

// Články - logika
let currentPage = 0;
const articlesPerPage = 3;
let allArticles = [];

async function loadArticles() {
    try {
        const res = await fetch('data/articles.json');
        allArticles = await res.json();
        renderArticles();
    } catch (e) {
        document.getElementById('articles-list').innerHTML = "Nepodarilo sa načítať články.";
    }
}

window.changePage = function(direction) {
    currentPage += direction;
    renderArticles();
};

function renderArticles() {
    const container = document.getElementById('articles-list');
    if (!container) return;

    const start = currentPage * articlesPerPage;
    const paginatedItems = allArticles.slice(start, start + articlesPerPage);

    container.innerHTML = paginatedItems.map(a => 
        `<div class="card"><h3>${a.title}</h3><p>${a.body}</p></div>`
    ).join('') + `
    <div class="pagination">
        <button onclick="changePage(-1)" ${currentPage === 0 ? 'disabled' : ''}>← Staršie</button>
        <button onclick="changePage(1)" ${(start + articlesPerPage >= allArticles.length) ? 'disabled' : ''}>Novšie →</button>
    </div>`;
}

// Inicializácia
const initialPage = window.location.pathname.replace('/', '') || 'home';
showPage(initialPage, false);
