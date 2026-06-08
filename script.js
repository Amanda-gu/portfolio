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
    return gallery.slice(0, 10).map(item => `
        <div class="win-gallery-item layout-${item.layout || 'full'}">
            <img src="${item.src}" alt="${item.caption || ''}">
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

// ink bleed — per-character cursor proximity effect
;(function () {

    const MAX_DIST = 50   // px — outer edge, no effect
    const INNER_DIST = 10 // px — full bleed
    const LEVELS = 5
    const FILTERS = ['', 'url(#ink-1)', 'url(#ink-2)', 'url(#ink-3)', 'url(#ink-4)', 'url(#ink-5)']

    let mouseX = -9999, mouseY = -9999
    let chars = []
    let rafId = null

    // split text nodes into .ink-char spans, preserving element structure
    function splitNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const frag = document.createDocumentFragment()
            for (const ch of node.textContent) {
                if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') {
                    frag.appendChild(document.createTextNode(ch))
                } else {
                    const span = document.createElement('span')
                    span.className = 'ink-char'
                    span.textContent = ch
                    frag.appendChild(span)
                }
            }
            node.replaceWith(frag)
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            ;[...node.childNodes].forEach(splitNode)
        }
    }

    // run after DOM is ready (projects load via fetch, main-content is static)
    splitNode(document.getElementById('main-content'))
    chars = [...document.querySelectorAll('#main-content .ink-char')]

    // Store positions as document coords so scroll is handled cheaply in tick.
    // Re-cache after fonts.ready because Macaulay shifts metrics vs the fallback.
    function cacheRects() {
        const sx = window.scrollX, sy = window.scrollY
        for (const span of chars) {
            const r = span.getBoundingClientRect()
            span._docX = r.left + sx + r.width  * 0.5
            span._docY = r.top  + sy + r.height * 0.5
        }
    }
    cacheRects()
    document.fonts.ready.then(cacheRects)
    let _resizeTimer
    window.addEventListener('resize', () => {
        clearTimeout(_resizeTimer)
        _resizeTimer = setTimeout(cacheRects, 100)
    }, { passive: true })

    const RISE = 0.01  // how fast ink builds up per frame (~1s to full)

    let inkEnabled = true

    function clearInk() {
        for (const span of chars) {
            span._inkVal = 0
            span._inkLevel = 0
            span.style.filter = ''
        }
    }

    function tick() {
        let anyRising = false

        const sx = window.scrollX, sy = window.scrollY
        for (const span of chars) {
            const cx = span._docX - sx
            const cy = span._docY - sy
            const dist = Math.hypot(cx - mouseX, cy - mouseY)

            let target = 0
            if (dist < MAX_DIST) {
                const norm = 1 - Math.max(0, (dist - INNER_DIST) / (MAX_DIST - INNER_DIST))
                target = norm * norm * LEVELS
            }

            const val = span._inkVal || 0
            const next = target > val ? val + (target - val) * RISE : val
            span._inkVal = next

            const level = Math.min(LEVELS, Math.ceil(next))
            if (span._inkLevel !== level) {
                span.style.filter = FILTERS[level]
                span._inkLevel = level
            }

            if (target > val + 0.001) anyRising = true
        }

        rafId = anyRising ? requestAnimationFrame(tick) : null
    }

    function scheduleTick() {
        if (!rafId) rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', e => {
        mouseX = e.clientX
        mouseY = e.clientY
        if (inkEnabled) scheduleTick()
    })

    window.addEventListener('touchmove', e => {
        mouseX = e.touches[0].clientX
        mouseY = e.touches[0].clientY
        if (inkEnabled) scheduleTick()
    }, { passive: true })

    const inkBtn = document.getElementById('ink-clear')
    inkBtn.addEventListener('click', () => {
        inkEnabled = !inkEnabled
        inkBtn.textContent = inkEnabled ? 'disable ink' : 'enable ink'
        if (!inkEnabled) clearInk()
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
