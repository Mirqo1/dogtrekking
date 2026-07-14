async function loadContent(page) {
    const contentDiv = document.getElementById('content');
    if (page === 'home') {
        const res = await fetch('data/articles.json');
        const articles = await res.json();
        contentDiv.innerHTML = articles.map(a => `<h2>${a.title}</h2><p>${a.body}</p>`).join('');
    }
    // Pridať podmienky pre 'about' a 'calendar'
}