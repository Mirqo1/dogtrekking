async function showPage(page) {
    const app = document.getElementById('app');
    const target = (page === '/' || page === '' || page === 'home') ? 'home' : page.replace('/', '');

    if (target === 'home') {
        app.innerHTML = `
            <section class="hero">
                <div class="hero-text">
                    <h1>Dogtrekking</h1>
                    <p><strong>Slovensko</strong></p>
                    <p>Dogtrekking je vytrvalostný kynologický šport, pri ktorom psovod so psom prekonávajú dlhú trasu v teréne.</p>
                    <div class="hero-buttons">
                        <a href="#" onclick="showPage('about'); return false;" class="btn-white">O dogtrekkingu</a>
                        <a href="#" onclick="showPage('calendar'); return false;" class="btn-yellow">Kalendár akcií</a>
                    </div>
                </div>
                <div class="hero-image"><img src="tvoj_obrazok.jpg" alt="Dogtrekking"></div>
            </section>
            <h2 style="text-align:center;">Posledné články</h2>
            <div class="articles-grid" id="articles-list">Načítavam články...</div>`;
        
        try {
            const res = await fetch('data/articles.json');
            const data = await res.json();
            document.getElementById('articles-list').innerHTML = data.map(a => 
                `<div class="card"><h3>${a.title}</h3><p>${a.body}</p></div>`).join('');
        } catch (e) { document.getElementById('articles-list').innerHTML = "Chyba načítania článkov."; }
    } 
    else if (target === 'calendar') {
        try {
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
                        <td>${e.name}</td>
                        <td>${e.location}</td>
                        <td><a href="${e.url}" target="_blank" class="btn-link">Viac info</a></td>
                    </tr>
                `).join('') + `</tbody></table>`;
            }
            app.innerHTML = html;
        } catch (e) {
            app.innerHTML = "<h2>Kalendár akcií</h2><p>Chyba pri načítaní dát.</p>";
        }
    } 
    else if (target === 'about') {
        app.innerHTML = `<h2>Čo je Dogtrekking</h2><p style="text-align:center;">Dogtrekking je vytrvalostný kynologický šport.</p>`;
    }
}

// Inicializácia pri otvorení stránky
showPage(window.location.pathname);
