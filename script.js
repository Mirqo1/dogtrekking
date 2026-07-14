async function showPage(page) {
    const app = document.getElementById('app');
    app.innerHTML = "Načítavam...";

    if (page === 'home') {
        const res = await fetch('data/articles.json');
        const data = await res.json();
        app.innerHTML = "<h2>Aktuality</h2>" + data.map(a => `<div><h3>${a.title}</h3><p>${a.body}</p></div>`).join('');
    } 
    else if (page === 'calendar') {
        const res = await fetch('data/events.json');
        const data = await res.json();
        let html = "<h2>Kalendár akcií</h2><table>";
        data.forEach(e => {
            html += `<tr><td>${e.date}</td><td>${e.name}</td><td>${e.location}</td>
                     <td><a href="${e.url}" class="btn-link" target="_blank">Viac info</a></td></tr>`;
        });
        app.innerHTML = html + "</table>";
    }
    else if (page === 'about') {
        app.innerHTML = "<h2>O dogtrekkingu</h2><p>Dogtrekking je...</p>";
    }
}
showPage('home');
