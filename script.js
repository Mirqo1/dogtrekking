function showPage(page) {
    const app = document.getElementById('app');
    
    if (page === 'home') {
        app.innerHTML = `
            <section class="hero">
                <div class="hero-text">
                    <h1>Dogtrekking</h1>
                    <p><strong>Slovensko</strong></p>
                    <p>Dogtrekking je vytrvalostný kynologický šport, pri ktorom psovod so psom prekonávajú dlhú trasu v teréne podľa mapy.</p>
                    <a href="#" onclick="showPage('about')" class="btn-white">O dogtrekkingu</a>
                    <a href="#" onclick="showPage('calendar')" class="btn-yellow">Kalendár akcií</a>
                </div>
                <div class="hero-image">
                    <img src="https://via.placeholder.com/400x300" alt="Dogtrekking">
                </div>
            </section>
            <h2 style="text-align:center;">Posledné články</h2>
            <div class="articles-grid">
                <div class="card"><h3>Článok 1</h3><p>Ukážka textu...</p></div>
                <div class="card"><h3>Článok 2</h3><p>Ukážka textu...</p></div>
                <div class="card"><h3>Článok 3</h3><p>Ukážka textu...</p></div>
            </div>`;
    } else if (page === 'calendar') {
        app.innerHTML = `<h2>Kalendár akcií</h2><p>Tu bude načítaný JSON...</p>`;
        // Tu môžeš doplniť volanie na načítanie kalendára
    } else if (page === 'about') {
        app.innerHTML = `<h2>O dogtrekkingu</h2><p>Podrobný popis športu...</p>`;
    }
}

// Inicializácia
showPage('home');
