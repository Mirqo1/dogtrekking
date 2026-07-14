// Hlavná funkcia na navigáciu a načítanie obsahu
async function showPage(page, pushState = true) {
    const contentDiv = document.getElementById('app');
    
    // Určenie cieľovej stránky
    const target = (page === '/' || page === '' || page === 'home') ? 'home' : page.replace('/', '');

    // Zmena URL v prehliadači bez reštartu stránky
    if (pushState) {
        history.pushState({page: target}, "", `/${target === 'home' ? '' : target}`);
    }

    contentDiv.innerHTML = "Načítavam...";

    try {
        if (target === 'home') {
            const res = await fetch('data/articles.json');
            const data = await res.json();
            contentDiv.innerHTML = `<h2>Aktuality</h2>` + data.map(a => 
                `<div class="card"><h3>${a.title}</h3><small>${a.date}</small><p>${a.body}</p></div>`
            ).join('');
        } 
        
        else if (target === 'calendar') {
            const res = await fetch('data/events.json');
            const data = await res.json();
            
            // Zoskupenie dát podľa mesiacov
            const grouped = data.reduce((acc, event) => {
                (acc[event.month] = acc[event.month] || []).push(event);
                return acc;
            }, {});

            let html = `<h2>Kalendár akcií</h2>`;
            
            for (const month in grouped) {
                html += `<h3>${month}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Vlajka</th>
                            <th>Dátum</th>
                            <th>Názov</th>
                            <th>Miesto</th>
                            <th>Web</th>
                        </tr>
                    </thead>
                    <tbody>` 
                    + grouped[month].map(e => `
                        <tr>
                            <td data-label="Vlajka"><img src="https://flagcdn.com/24x18/${e.country.toLowerCase()}.png" alt="${e.country}"></td>
                            <td data-label="Dátum">${e.date}</td>
                            <td data-label="Názov">${e.name}</td>
                            <td data-label="Miesto">${e.location}</td>
                            <td data-label="Web"><a href="${e.url}" target="_blank" class="btn-link">Viac info</a></td>
                        </tr>
                    `).join('') + 
                    `</tbody>
                </table>`;
            }
            contentDiv.innerHTML = html;
        } 
        
        else if (target === 'about') {
            contentDiv.innerHTML = `<h2>Čo je Dogtrekking</h2><p>Dogtrekking je vytrvalostný kynologický šport, pri ktorom psovod so psom prekonávajú dlhú trasu v teréne.</p>`;
        } 
        
        else {
            // Ak je link neplatný, presmeruje na domov
            window.location.pathname = '/';
        }
    } catch (e) {
        contentDiv.innerHTML = "Chyba pri načítaní dát. Skontroluj, či existuje zložka /data.";
        console.error(e);
    }
}

// Ošetrenie tlačidiel späť/vpred v prehliadači
window.onpopstate = function(event) {
    const page = event.state ? event.state.page : 'home';
    showPage(page, false);
};

// Počiatočné načítanie stránky podľa aktuálnej URL
showPage(window.location.pathname);
