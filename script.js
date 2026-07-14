async function showPage(page, pushState = true) {
    const contentDiv = document.getElementById('app');
    const target = (page === '/' || page === '' || page === 'home') ? 'home' : page.replace('/', '');

    if (pushState) {
        history.pushState({page: target}, "", `/${target === 'home' ? '' : target}`);
    }

    contentDiv.innerHTML = "Načítavam...";

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
                        <td>${e.name}</td>
                        <td>${e.location}</td>
                        <td><a href="${e.url}" target="_blank" class="btn-link">Viac info</a></td>
                    </tr>
                `).join('') + `</tbody></table>`;
            }
            contentDiv.innerHTML = html;
        } else if (target === 'about') {
            contentDiv.innerHTML = `<h2>Čo je Dogtrekking</h2><p>Dogtrekking je vytrvalostný kynologický šport.</p>`;
        }
    } catch (e) {
        contentDiv.innerHTML = "Chyba pri načítaní.";
    }
}

showPage(window.location.pathname);
