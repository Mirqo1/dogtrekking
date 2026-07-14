async function showPage(page) {
    const contentDiv = document.getElementById('app');
    contentDiv.innerHTML = "Načítavam...";

    if (page === 'home') {
        const response = await fetch('data/articles.json');
        const data = await response.json();
        contentDiv.innerHTML = `<h2>Aktuality</h2>` + data.map(a => 
            `<div class="card"><h3>${a.title}</h3><small>${a.date}</small><p>${a.body}</p></div>`
        ).join('');
    } 
    else if (page === 'calendar') {
        const response = await fetch('data/events.json');
        const data = await response.json();
        contentDiv.innerHTML = `<h2>Kalendár akcií</h2><ul>` + data.map(e => 
            `<li><strong>${e.name}</strong> - ${e.date} (${e.location})</li>`
        ).join('') + `</ul>`;
    }
    else if (page === 'about') {
        contentDiv.innerHTML = `<h2>Čo je Dogtrekking</h2><p>Dogtrekking je vytrvalostný kynologický šport...</p>`;
    }
}

// Načítaj domov po otvorení stránky
showPage('home');
