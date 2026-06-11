;(function () {
    const link = document.getElementById('email-copy')
    if (!link) return
    const tip = document.createElement('div')
    tip.id = 'email-tooltip'
    tip.textContent = 'click to copy'
    document.body.appendChild(tip)

    link.addEventListener('mousemove', (e) => {
        tip.style.left = (e.clientX + 14) + 'px'
        tip.style.top  = (e.clientY + 14) + 'px'
        tip.classList.add('visible')
    })
    link.addEventListener('mouseleave', () => {
        tip.classList.remove('visible')
    })
})()

function copyEmail(e) {
    e.preventDefault()
    const email = 'itsamandaguo@gmail.com'
    const link = document.getElementById('email-copy')
    link.textContent = 'copied!'
    setTimeout(() => { link.textContent = email }, 1500)
    try {
        navigator.clipboard.writeText(email)
    } catch (_) {
        const ta = document.createElement('textarea')
        ta.value = email
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
    }
}

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
const _hLine = document.getElementById('h-line')
const _vLine = document.getElementById('v-line')
const _sq    = document.getElementById('sq')
let _cx = 0, _cy = 0, _rafPending = false

function _applyCursor() {
    const t = `translate(${_cx}px, ${_cy}px)`
    _hLine.style.transform = t
    _vLine.style.transform = t
    _sq.style.transform    = t
    document.querySelectorAll('#project .img-cursor').forEach(img => {
        img.style.left = `${_cx}px`
        img.style.top  = `${_cy}px`
    })
    _rafPending = false
}

window.addEventListener('pointermove', (e) => {
    _cx = e.clientX
    _cy = e.clientY
    if (!_rafPending) {
        _rafPending = true
        requestAnimationFrame(_applyCursor)
    }
}, { passive: true })

let projectsData = []

// multiple windows
const windows = new Map() // projectId → windowEl
let zTop = 100

function galleryHTML(gallery) {
    if (!gallery || !gallery.length) return ''
    return gallery.map(item => `
        <div class="win-gallery-item layout-${item.layout || 'full'}">
            <img src="${item.src}" alt="${item.caption || ''}">
            ${item.src2 ? `<img src="${item.src2}" alt="">` : ''}
            ${item.caption ? `<p class="win-caption">${item.caption}</p>` : ''}
        </div>
    `).join('')
}

function createWindow(project) {
    const win = document.createElement('div')
    win.className = 'project-window'
    win.innerHTML = `
        <div class="win-header">
            <div class="win-controls">
                <button class="win-close">
                    <svg viewBox="0 0 429 429" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2.5" y="2.5" width="423.294" height="423.294" stroke="currentColor" stroke-width="5"/>
                        <line x1="329.404" y1="102.427" x2="102.428" y2="329.403" stroke="currentColor" stroke-width="5"/>
                        <line y1="-2.5" x2="320.992" y2="-2.5" transform="matrix(0.707107 0.707107 0.707107 -0.707107 100.659 100.659)" stroke="currentColor" stroke-width="5"/>
                    </svg>
                </button>
                <button class="win-fullscreen"></button>
            </div>
            ${project.url ? `<a class="win-link text-links" href="${project.url}">visit ↗</a>` : ''}
        </div>
        <div class="win-info">
            <p class="win-title">${project.title}</p>
            <section class="tags">${project.tags.map(t => `<tag>${t}</tag>`).join('')}</section>
        </div>
        <div class="win-gallery">${galleryHTML(project.gallery)}</div>
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

    win.querySelector('.win-fullscreen').addEventListener('click', () => {
        win.classList.toggle('fullscreen')
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

// ink bleed — ring-based cursor proximity effect
;(function () {

    // Outer radius and fade-start for each level (1=outermost, 5=innermost)
    const RINGS = [
        { r: 303, fade: 48, filter: 'url(#ink-1)' },
        { r: 90, fade: 38, filter: 'url(#ink-2)' },
        { r: 48, fade: 28, filter: 'url(#ink-3)' },
        { r: 25, fade: 18, filter: 'url(#ink-4)' },
        { r: 13, fade:  8, filter: 'url(#ink-5)' },
    ]

    // Create one full-viewport overlay div per level
    const mainEl    = document.getElementById('main-content')
    const container = mainEl ? mainEl.parentElement : document.body

    const maskCircles = RINGS.map((cfg, i) => {
        const c = document.getElementById(`ink-mc-${i + 1}`)
        if (c) c.setAttribute('r', cfg.r)
        return c
    })

    const rings = RINGS.map((cfg, i) => {
        const div = document.createElement('div')
        div.className = 'ink-ring'
        div.style.filter = cfg.filter
        div.style.zIndex = i + 1
        div.style.webkitMask = `url(#ink-mask-${i + 1})`
        div.style.mask       = `url(#ink-mask-${i + 1})`
        container.appendChild(div)
        return { div, ...cfg, clone: null }
    })

    function buildClones() {
        if (!mainEl) return
        const rect = mainEl.getBoundingClientRect()

        for (const ring of rings) {
            if (ring.clone) ring.clone.remove()
            const clone = mainEl.cloneNode(true)
            // Keep root id so `main #main-content` CSS rules apply to the clone
            clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'))
            clone.setAttribute('aria-hidden', 'true')
            // Only show paragraphs — hide links and last-updated timestamp
            clone.querySelectorAll('a, time').forEach(el => el.style.visibility = 'hidden')
            Object.assign(clone.style, {
                position  : 'absolute',
                top       : '0',
                left      : '0',
                transform : `translate(${rect.left}px, ${rect.top}px)`,
                width     : rect.width + 'px',
                margin    : '0',
            })
            ring.clone = clone
            ring.div.appendChild(clone)
        }
    }

    function updateClonePositions() {
        if (!mainEl) return
        const rect = mainEl.getBoundingClientRect()
        for (const ring of rings) {
            if (ring.clone) ring.clone.style.transform = `translate(${rect.left}px, ${rect.top}px)`
        }
    }

    function updateMasks(x, y) {
        for (const c of maskCircles) {
            if (c) { c.setAttribute('cx', x); c.setAttribute('cy', y) }
        }
    }

    buildClones()
    document.fonts.ready.then(buildClones)

    // Rebuild when projects are injected
    const projectList = document.getElementById('project')
    if (projectList) {
        new MutationObserver(buildClones).observe(projectList, { childList: true })
    }

    let inkEnabled = true

    window.addEventListener('pointermove', e => {
        if (inkEnabled) updateMasks(e.clientX, e.clientY)
    }, { passive: true })

    window.addEventListener('touchmove', e => {
        if (inkEnabled) updateMasks(e.touches[0].clientX, e.touches[0].clientY)
    }, { passive: true })

    window.addEventListener('scroll', updateClonePositions, { passive: true })

    let _resizeTimer
    window.addEventListener('resize', () => {
        clearTimeout(_resizeTimer)
        _resizeTimer = setTimeout(buildClones, 100)
    }, { passive: true })

    const inkBtn = document.getElementById('ink-clear')
    inkBtn.addEventListener('click', () => {
        inkEnabled = !inkEnabled
        inkBtn.textContent = inkEnabled ? 'disable ink' : 'enable ink'
        if (!inkEnabled) updateMasks(-9999, -9999)
    })
})()

// render projects from JSON
fetch('content/projects.json')
    .then(r => r.json())
    .then(({ order }) => Promise.all(
        order.map(id => fetch(`content/projects/${id}.json`).then(r => r.json()))
    ))
    .then(projects => {
        projectsData = projects
        const list = document.getElementById('project')
        list.innerHTML = projects.map(p => `
            <li class="card" id="${p.id}" data-id="${p.id}">
                <div class="cardinfo second-cta">
                    <div class="card-text">
                        <section class="cardtitle text-links">
                            <p>${p.title}</p>
                            <p class="arrow">↗</p>
                        </section>
                        <section class="tags">
                            ${p.tags.map(t => `<tag>${t}</tag>`).join('')}
                        </section>
                    </div>
                    ${p.image ? `<img class="img-cursor" src="${p.image}" alt="${p.title}"><img class="img-static" src="${p.image}" alt="${p.title}">` : ''}
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

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'))
                btn.classList.add('active')
                document.getElementById('project').dataset.view = btn.dataset.view
            })
        })
    })
