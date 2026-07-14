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
                    <a href="#" onclick="showPage('about'); return false;" class="btn-white">O dogtrekkingu</a>
                    <a href="#" onclick="showPage('calendar'); return false;" class="btn-yellow">Kalendár akcií</a>
                </div>
                <div class="hero-image"><img src="tvoj_obrazok.jpg" alt="Dogtrekking"></div>
            </section>
            <h2 style="text-align:center;">Posledné články</h2>
            <div class="articles-grid" id="articles-list">Načítavam...</div>`;
        
        const res = await fetch('data/articles.json');
        const data = await res.json();
        document.getElementById('articles-list').innerHTML = data.map(a => 
            `<div class="card"><h3>${a.title}</h3><p>${a.body}</p></div>`).join('');
    } 
    else if (target === 'calendar') {
        const res = await fetch('data/events.json');
        const data = await res.json();
        // ... (kód pre tabuľku, ako sme mali predtým)
        app.innerHTML = `<h2>Kalendár akcií</h2>...`; 
    }
}
showPage('home');
