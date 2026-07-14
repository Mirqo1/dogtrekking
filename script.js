async function showPage(page) {
    const app = document.getElementById('app');
    const target = (page === '/' || page === '' || page === '/home') ? 'home' : page.replace('/', '');

    if (target === 'home') {
        app.innerHTML = `
            <section style="display:flex; align-items:center; gap:40px; margin-bottom:50px;">
                <div><h1>Dogtrekking</h1><p>Slovensko</p><p>Uvítací text o dogtrekkingu...</p>
                <a href="#" onclick="showPage('about')" class="btn-white">O dogtrekkingu</a>
                <a href="#" onclick="showPage('calendar')" class="btn-yellow">Kalendár akcií</a></div>
                <img src="https://via.placeholder.com/400" alt="Dogtrekking">
            </section>
            <div class="articles-grid">
                <div class="card">Článok 1</div><div class="card">Článok 2</div><div class="card">Článok 3</div>
            </div>`;
    } 
    // ... tu doplň zvyšok tvojej logiky pre calendar/about ako predtým
}
