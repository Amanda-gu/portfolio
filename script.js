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

let projectsData = []

function openModal(project) {
    document.getElementById('modal-title').textContent = project.title
    document.getElementById('modal-link').href = project.url

    const img = document.getElementById('modal-image')
    img.src = project.image || ''
    img.alt = project.title
    img.style.display = project.image ? '' : 'none'

    const tagsEl = document.getElementById('modal-tags')
    tagsEl.innerHTML = project.tags.map(t => `<tag>${t}</tag>`).join('')

    document.getElementById('project-modal').classList.add('open')
}

function closeModal() {
    document.getElementById('project-modal').classList.remove('open')
}

document.getElementById('modal-close').addEventListener('click', closeModal)
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal()
})
document.addEventListener('click', e => {
    const modal = document.getElementById('project-modal')
    if (modal.classList.contains('open') && !modal.contains(e.target)) closeModal()
})

// render projects from JSON
fetch('content/projects.json')
    .then(r => r.json())
    .then(({ projects }) => {
        projectsData = projects
        const list = document.getElementById('project')
        list.innerHTML = projects.map(p => `
            <li class="card" id="${p.id}" data-id="${p.id}">
                <div class="cardinfo second-cta">
                    <section class="cardtitle text-links">
                        <p>${p.title}</p>
                        <p class="arrow">↗</p>
                    </section>
                    <section class="tags">
                        ${p.tags.map(t => `<tag>${t}</tag>`).join('')}
                    </section>
                    ${p.image ? `<img src="${p.image}" alt="${p.title}">` : ''}
                </div>
            </li>
        `).join('')

        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation()
                const project = projectsData.find(p => p.id === card.dataset.id)
                if (project) openModal(project)
            })
        })
    })
