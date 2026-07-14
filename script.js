async function showPage(page) {
    const contentDiv = document.getElementById('app');
    const target = page || 'home';
    
    // Časovač, ktorý po 3 sekundách skontroluje, či sme niečo načítali
    const timer = setTimeout(() => {
        if (contentDiv.innerHTML === "Načítavam...") {
            console.log("Stránka nenájdená, vraciam na domov.");
            window.location.hash = "#home"; // Presmeruje na homepage
        }
    }, 3000); 

    try {
        if (target === 'home') {
            const res = await fetch('data/articles.json');
            const data = await res.json();
            clearTimeout(timer); // Zruší časovač, ak sa dáta načítali
            contentDiv.innerHTML = `<h2>Aktuality</h2>` + data.map(a => 
                `<div class="card"><h3>${a.title}</h3><small>${a.date}</small><p>${a.body}</p></div>`
            ).join('');
        } else if (target === 'calendar') {
            const res = await fetch('data/events.json');
            const data = await res.json();
            clearTimeout(timer);
            contentDiv.innerHTML = `<h2>Kalendár akcií</h2><ul>` + data.map(e => 
                `<li><strong>${e.name}</strong> - ${e.date} (${e.location})</li>`
            ).join('') + `</ul>`;
        } else if (target === 'about') {
            clearTimeout(timer);
            contentDiv.innerHTML = `<h2>Čo je Dogtrekking</h2><p>Dogtrekking je vytrvalostný šport...</p>`;
        } else {
            // Ak je zadaný neznámy hash (napr. #blbost), rovno presmeruj
            clearTimeout(timer);
            window.location.hash = "#home";
        }
    } catch (e) {
        clearTimeout(timer);
        contentDiv.innerHTML = "Chyba pri načítaní obsahu.";
        setTimeout(() => { window.location.hash = "#home"; }, 2000);
    }
}

window.addEventListener('hashchange', () => {
    showPage(window.location.hash.substring(1));
});

showPage(window.location.hash.substring(1));
