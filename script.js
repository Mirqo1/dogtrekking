async function showPage(page, pushState = true) {
    const contentDiv = document.getElementById('app');
    const target = (page === '/' || page === '' || page === 'home') ? 'home' : page.replace('/', '');

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
            contentDiv.innerHTML = `<h2>Čo je Dogtrekking</h2><p>Dogtrekking je vytrvalostný kynologický šport...</p>`;
        }
    } catch (e) {
        contentDiv.innerHTML = "Chyba pri načítaní obsahu.";
    }
}

// Inicializácia pri otvorení stránky
showPage(window.location.pathname);
