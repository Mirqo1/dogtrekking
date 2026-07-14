async function showPage(page, addToHistory = true) {
    const contentDiv = document.getElementById('app');
    
    // Zmena URL v riadku prehliadača
    if (addToHistory) {
        history.pushState({page: page}, "", `/${page === 'home' ? '' : page}`);
    }

    contentDiv.innerHTML = "Načítavam...";

    try {
        if (page === 'home' || page === '') {
            const res = await fetch('data/articles.json');
            const data = await res.json();
            contentDiv.innerHTML = `<h2>Aktuality</h2>` + data.map(a => 
                `<div class="card"><h3>${a.title}</h3><small>${a.date}</small><p>${a.body}</p></div>`
            ).join('');
        } else if (page === 'calendar') {
            const res = await fetch('data/events.json');
            const data = await res.json();
            contentDiv.innerHTML = `<h2>Kalendár akcií</h2><ul>` + data.map(e => 
                `<li><strong>${e.name}</strong> - ${e.date} (${e.location})</li>`
            ).join('') + `</ul>`;
        } else if (page === 'about') {
            contentDiv.innerHTML = `<h2>Čo je Dogtrekking</h2><p>Dogtrekking je vytrvalostný šport...</p>`;
        }
    } catch (e) {
        contentDiv.innerHTML = "Chyba pri načítaní obsahu.";
    }
}

// Reakcia na tlačidlá späť/vpred v prehliadači
window.onpopstate = function(event) {
    const page = event.state ? event.state.page : 'home';
    showPage(page, false);
};

// Pri načítaní stránky zisti, kde sa užívateľ nachádza
const path = window.location.pathname.replace('/', '') || 'home';
showPage(path, false);
