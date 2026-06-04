// custom cursor
window.addEventListener('pointermove', (e) => {
    document.getElementById('h-line').style.left = `${e.clientX}px`
    document.getElementById('h-line').style.top  = `${e.clientY}px`
    document.getElementById('v-line').style.left = `${e.clientX}px`
    document.getElementById('v-line').style.top  = `${e.clientY}px`
    document.getElementById('sq').style.left     = `${e.clientX}px`
    document.getElementById('sq').style.top      = `${e.clientY}px`

    document.querySelectorAll('#project img').forEach((img) => {
        img.style.left = `${e.clientX}px`
        img.style.top  = `${e.clientY}px`
    })
})

// render projects from JSON
fetch('/content/projects.json')
    .then(r => r.json())
    .then(({ projects }) => {
        const list = document.getElementById('project')
        list.innerHTML = projects.map(p => `
            <li class="card" id="${p.id}">
                <a href="${p.url}" class="cardinfo second-cta">
                    <section class="cardtitle text-links">
                        <p>${p.title}</p>
                        <p class="arrow">↗</p>
                    </section>
                    <section class="tags">
                        ${p.tags.map(t => `<tag>${t}</tag>`).join('')}
                    </section>
                    ${p.image ? `<img src="${p.image}" alt="${p.title}">` : ''}
                </a>
            </li>
        `).join('')
    })
