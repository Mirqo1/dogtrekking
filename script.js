async function showPage(page) {
    const contentDiv = document.getElementById('app');
    contentDiv.innerHTML = "Načítavam...";

    // Ak page nie je zadané, default je 'home'
    const target = page || 'home';

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
        }
    } catch (e) {
        contentDiv.innerHTML = "Chyba pri načítaní.";
    }
}

// Počúvanie na zmenu hashu v URL (napr. po kliknutí alebo refreshi)
window.addEventListener('hashchange', () => {
    showPage(window.location.hash.substring(1));
});

// Inicializácia pri otvorení stránky
showPage(window.location.hash.substring(1));
