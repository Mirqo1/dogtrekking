async function showPage(page) {
    const app = document.getElementById('app');
    
    if (page === 'home') {
        app.innerHTML = `
            <section class="hero">
                <div class="hero-text">
                    <h1>Dogtrekking</h1>
                    <p><strong>Slovensko</strong></p>
                    <p>Dogtrekking je vytrvalostný kynologický šport, pri ktorom psovod so psom prekonávajú dlhú trasu v teréne.</p>
                    <div class="hero-buttons">
                        <a href="#" onclick="showPage('about')" class="btn-white">O dogtrekkingu</a>
                        <a href="#" onclick="showPage('calendar')" class="btn-yellow">Kalendár akcií</a>
                    </div>
                </div>
                <div class="hero-image"><img src="dog-hero.jpg" alt="Dogtrekking"></div>
            </section>
            <div class="articles-grid" id="articles-list">Načítavam články...</div>`;
        
        const res = await fetch('data/articles.json');
        const data = await res.json();
        document.getElementById('articles-list').innerHTML = data.map(a => 
            `<div class="card"><h3>${a.title}</h3><p>${a.body}</p></div>`).join('');
            
    } else if (page === 'calendar') {
        const res = await fetch('data/events.json');
        const data = await res.json();
        const grouped = data.reduce((acc, e) => { (acc[e.month] = acc[e.month] || []).push(e); return acc; }, {});
        
        let html = `<h2>Kalendár akcií</h2>`;
        for (const m in grouped) {
            html += `<h3>${m}</h3><table><tbody>` + grouped[m].map(e => `
                <tr>
                    <td><img src="https://flagcdn.com/24x18/${e.country.toLowerCase()}.png"></td>
                    <td>${e.date}</td><td>${e.name}</td><td>${e.location}</td>
                    <td><a href="${e.url}" target="_blank" class="btn-yellow">Viac info</a></td>
                </tr>`).join('') + `</tbody></table>`;
        }
        app.innerHTML = html;
    }
}
showPage('home');
