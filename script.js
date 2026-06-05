// theme toggle
;(function () {
    const root = document.documentElement
    const btn  = document.getElementById('theme-toggle')

    function apply(theme) {
        root.style.colorScheme = theme
        localStorage.setItem('theme', theme)
        btn.textContent = theme === 'dark' ? 'light' : 'dark'
    }

    const saved = localStorage.getItem('theme') ||
        (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    apply(saved)

    btn.addEventListener('click', () => {
        apply(root.style.colorScheme === 'dark' ? 'light' : 'dark')
    })
})()

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

// multiple windows
const windows = new Map() // projectId → windowEl
let zTop = 100

function createWindow(project) {
    const win = document.createElement('div')
    win.className = 'project-window'
    win.innerHTML = `
        <div class="win-header">
            <button class="win-close">
                <svg viewBox="0 0 429 429" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2.5" y="2.5" width="423.294" height="423.294" stroke="currentColor" stroke-width="5"/>
                    <line x1="329.404" y1="102.427" x2="102.428" y2="329.403" stroke="currentColor" stroke-width="5"/>
                    <line y1="-2.5" x2="320.992" y2="-2.5" transform="matrix(0.707107 0.707107 0.707107 -0.707107 100.659 100.659)" stroke="currentColor" stroke-width="5"/>
                </svg>
            </button>
            <a class="win-link text-links" href="${project.url}">visit ↗</a>
        </div>
        <p class="win-title">${project.title}</p>
        <div class="win-tags">${project.tags.map(t => `<tag>${t}</tag>`).join('')}</div>
        ${project.image ? `<img class="win-image" src="${project.image}" alt="${project.title}">` : ''}
    `

    win.style.zIndex = ++zTop

    const isMobile = window.innerWidth < 700
    if (!isMobile) {
        const offset = windows.size * 24
        win.style.left = `calc(50% - 11rem + ${offset}px)`
        win.style.top  = `calc(50% - 17.5rem + ${offset}px)`
    }

    win.querySelector('.win-close').addEventListener('click', () => {
        win.remove()
        windows.delete(project.id)
    })

    if (!isMobile) makeDraggable(win, win.querySelector('.win-header'))
    win.addEventListener('pointerdown', () => { win.style.zIndex = ++zTop })

    document.body.appendChild(win)
    windows.set(project.id, win)

    // trigger open animation
    requestAnimationFrame(() => win.classList.add('open'))
}


function makeDraggable(win, handle) {
    let dragging = false, lastX, lastY

    handle.addEventListener('mousedown', e => {
        if (e.target.closest('button, a')) return
        dragging = true
        lastX = e.clientX
        lastY = e.clientY
        const r = win.getBoundingClientRect()
        win.style.left = r.left + 'px'
        win.style.top  = r.top  + 'px'
        win.style.transition = 'none'
        e.preventDefault()
    })

    document.addEventListener('mousemove', e => {
        if (!dragging) return
        win.style.left = (parseFloat(win.style.left) + e.clientX - lastX) + 'px'
        win.style.top  = (parseFloat(win.style.top)  + e.clientY - lastY) + 'px'
        lastX = e.clientX
        lastY = e.clientY
    })

    document.addEventListener('mouseup', () => {
        if (dragging) {
            dragging = false
            win.style.transition = ''
        }
    })
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        // close topmost window
        const all = [...document.querySelectorAll('.project-window')]
        if (!all.length) return
        const top = all.reduce((a, b) => +a.style.zIndex > +b.style.zIndex ? a : b)
        top.remove()
        for (const [id, el] of windows) if (el === top) windows.delete(id)
    }
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
                if (!project) return
                if (windows.has(project.id)) {
                    windows.get(project.id).style.zIndex = ++zTop
                } else {
                    createWindow(project)
                }
            })
        })
    })
