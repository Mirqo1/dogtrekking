try {
        if (target === 'home') {
            app.innerHTML = `
                <section class="hero">
                    <div class="hero-text">
                        <h1>Dogtrekking</h1>
                        <p><strong>Slovensko</strong></p>
                        <p>Dogtrekking je vytrvalostný kynologický šport...</p>
                        <div class="hero-buttons">
                            <a href="/about" onclick="showPage('about'); return false;" class="btn-white">O dogtrekkingu</a>
                            <a href="/calendar" onclick="showPage('calendar'); return false;" class="btn-yellow">Kalendár akcií</a>
                        </div>
                    </div>
                    <div class="hero-image"><img src="img/dogtrekking-hero.jpg" alt="Dogtrekking"></div>
                </section>
                <h2 style="text-align:center;">Posledné články</h2>
                <div class="articles-grid" id="articles-list">Načítavam...</div>`;
            
            // Toto je jediná správna cesta, ako načítať články na home
            loadArticles(); 

        } else if (target === 'calendar') {
            const res = await fetch('data/events.json');
            const data = await res.json();
            
            const grouped = data.reduce((acc, event) => {
                (acc[event.month] = acc[event.month] || []).push(event);
                return acc;
            }, {});

            let html = `<h2>Kalendár akcií</h2>`;
            for (const month in grouped) {
                html += `<h3>${month}</h3><table><tbody>` 
                + grouped[month].map(e => `
                    <tr>
                        <td><img src="https://flagcdn.com/24x18/${e.country.toLowerCase()}.png" alt="${e.country}"></td>
                        <td>${e.date}</td>
                        <td style="text-align: center; font-weight: bold;">${e.name}</td>
                        <td>${e.location}</td>
                        <td><a href="${e.url}" target="_blank" class="btn-link">Viac info</a></td>
                    </tr>
                `).join('') + `</tbody></table>`;
            }
            app.innerHTML = html;

        } else if (target === 'about') {
            app.innerHTML = `<h2>Čo je Dogtrekking</h2><p style="text-align:center;">Dogtrekking je vytrvalostný kynologický šport.</p>`;
        }
    } catch (e) {
        console.error(e); // Toto ti vypíše chybu do konzoly (F12), ak sa niečo nepodarí
        app.innerHTML = "Chyba pri načítaní obsahu.";
    }
