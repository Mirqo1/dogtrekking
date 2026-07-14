async function showPage(page, pushState = true) {
    const contentDiv = document.getElementById('app');
    // Ak je cesta prázdna (napr. /), nastav na 'home'
    const target = (page === '/' || page === '') ? 'home' : page.replace('/', '');

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
        } else if (target === 'calendar') {
            const res = await fetch('data/events.json');
            const data = await res.json();
            contentDiv.innerHTML = `<h2>Kalendár akcií</h2><ul>` + data.map(e => 
                `<li><strong>${e.name}</strong> - ${e.date} (${e.location})</li>`
            ).join('') + `</ul>`;
        } else if (target === 'about') {
            contentDiv.innerHTML = `<h2>Čo je Dogtrekking</h2><p>Dogtrekking je vytrvalostný šport...</p>`;
        } else {
            // Ak je link neplatný, pošli na home
            window.location.pathname = '/';
        }
    } catch (e) {
        contentDiv.innerHTML = "Chyba pri načítaní.";
    }
}

// Odkazy v menu zmeň na toto:
// <a href="#" onclick="showPage('home'); return false;">Domov</a>
// <a href="#" onclick="showPage('calendar'); return false;">Kalendár</a>

// Inicializácia pri otvorení stránky
showPage(window.location.pathname);
