// Mobile menu
const nav = document.getElementById('nav')
const navLinks = document.getElementById('navLinks')
const navToggle = document.getElementById('navToggle')

function setMenu(open) {
    navLinks.classList.toggle('open', open)
    navToggle.setAttribute('aria-expanded', String(open))
    navToggle.innerHTML = open ? '<i class="uil uil-times"></i>' : '<i class="uil uil-bars"></i>'
}
navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')))
navLinks.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false) })

// Border under the nav once the page scrolls
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8)
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

// Highlight the nav link for the section in view
const links = [...navLinks.querySelectorAll('a')]
const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean)
if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return
            links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id))
        })
    }, { rootMargin: '-45% 0px -50% 0px' })
    sections.forEach(s => spy.observe(s))
    // Nothing is highlighted while the hero is on screen
    spy.observe(document.querySelector('.hero'))

    // Fade sections in as they arrive
    const reveal = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return
            entry.target.classList.add('in')
            reveal.unobserve(entry.target)
        })
    }, { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach((el, i) => {
        el.style.transitionDelay = (i % 3) * 70 + 'ms'
        reveal.observe(el)
    })
} else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'))
}

document.getElementById('year').textContent = new Date().getFullYear()

// ---------- Code pad: new tabs you can type in ----------
;(function codePad() {
    const tabsEl = document.getElementById('cwTabs')
    const addBtn = document.getElementById('cwAdd')
    const staticPane = document.getElementById('cwStatic')
    const editor = document.getElementById('cwEditor')
    const input = document.getElementById('edInput')
    const hl = document.getElementById('edHl')
    const gutter = document.getElementById('edGutter')
    const footLeft = document.getElementById('cwLeft')
    const footRight = document.getElementById('cwRight')
    if (!tabsEl || !input) return

    const STORE = 'aathif-codepad-v1'
    const MAX_TABS = 4
    const STARTER = [
        '// Scratch pad — type anything you like.',
        '// Double-click a tab to rename it.',
        '',
        'function greet(name) {',
        '  return `Hello, ${name}!`;',
        '}',
        '',
        'console.log(greet("world"));',
        ''
    ].join('\n')

    const LANGS = {
        js: ['JS', 'JavaScript'], ts: ['TS', 'TypeScript'], py: ['PY', 'Python'],
        html: ['<>', 'HTML'], css: ['#', 'CSS'], txt: ['TXT', 'Plain text']
    }
    const extOf = name => {
        const m = /\.([a-z0-9]+)$/i.exec(name)
        const e = m ? m[1].toLowerCase() : 'txt'
        return LANGS[e] ? e : 'txt'
    }

    let state = { tabs: [], active: 'engineer', seq: 0 }
    try {
        const saved = JSON.parse(localStorage.getItem(STORE))
        if (saved && Array.isArray(saved.tabs)) state = Object.assign(state, saved)
    } catch (e) { /* storage unavailable — the pad still works for this visit */ }
    const save = () => { try { localStorage.setItem(STORE, JSON.stringify(state)) } catch (e) {} }

    // --- syntax highlighting (small and forgiving) ---
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const KEYWORDS = 'const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|new|import|export|default|from|as|async|await|try|catch|finally|throw|typeof|instanceof|in|of|this|super|extends|interface|type|enum|public|private|protected|static|readonly|void|def|elif|lambda|pass|with|yield|print|and|or|not|is|None'
    const COMMENTS = {
        py: /#.*$/.source,
        html: /<!--[\s\S]*?-->/.source,
        other: /\/\/.*$|\/\*[\s\S]*?\*\//.source
    }
    const STRINGS = /"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\.|[^`\\])*`?/.source
    const TAGS = /<\/?[a-zA-Z][\w-]*|\/?>/.source

    function highlight(code, ext) {
        if (ext === 'txt') return esc(code)
        const re = new RegExp(
            '(' + (COMMENTS[ext] || COMMENTS.other) + ')' +
            '|(' + STRINGS + ')' +
            '|\\b(' + KEYWORDS + ')\\b' +
            '|\\b(true|false|null|undefined|True|False|NaN)\\b' +
            '|\\b(\\d+(?:\\.\\d+)?)\\b' +
            (ext === 'html' ? '|(' + TAGS + ')' : ''), 'gm')
        let out = '', last = 0, m
        while ((m = re.exec(code))) {
            if (m[0] === '') { re.lastIndex++; continue }
            out += esc(code.slice(last, m.index))
            const cls = m[1] ? 't-com' : m[2] ? 't-str' : m[3] ? 't-key' : m[4] ? 't-bool' : m[5] ? 't-num' : 't-tag'
            out += '<span class="' + cls + '">' + esc(m[0]) + '</span>'
            last = re.lastIndex
        }
        return out + esc(code.slice(last))
    }

    // --- rendering ---
    const activeTab = () => state.tabs.find(t => t.id === state.active)

    function renderTabs() {
        tabsEl.innerHTML = ''
        const all = [{ id: 'engineer', name: 'engineer.ts', fixed: true }].concat(state.tabs)
        all.forEach(t => {
            const ext = extOf(t.name)
            const el = document.createElement('div')
            el.className = 'cw-tab' + (t.id === state.active ? ' active' : '')
            el.setAttribute('role', 'tab')
            el.setAttribute('aria-selected', String(t.id === state.active))
            el.tabIndex = 0
            el.dataset.id = t.id
            el.innerHTML = '<b class="l-' + ext + '">' + esc(LANGS[ext][0]) + '</b><span class="cw-name"></span>'
            el.querySelector('.cw-name').textContent = t.name
            if (!t.fixed) {
                el.title = 'Double-click to rename'
                const x = document.createElement('button')
                x.type = 'button'
                x.className = 'cw-close'
                x.setAttribute('aria-label', 'Close ' + t.name)
                x.textContent = '×'
                el.appendChild(x)
            }
            tabsEl.appendChild(el)
        })
        addBtn.disabled = state.tabs.length >= MAX_TABS
        const act = tabsEl.querySelector('.cw-tab.active')
        // Keep the active tab fully visible, clear of the pinned engineer.ts tab
        const pinned = tabsEl.querySelector('.cw-tab[data-id="engineer"]')
        if (act && act !== pinned) {
            const strip = tabsEl.getBoundingClientRect(), r = act.getBoundingClientRect()
            const leftLimit = strip.left + pinned.offsetWidth
            if (r.left < leftLimit) tabsEl.scrollLeft -= leftLimit - r.left
            else if (r.right > strip.right) tabsEl.scrollLeft += r.right - strip.right
        }
    }

    function renderEditor() {
        const tab = activeTab()
        if (!tab) return
        const ext = extOf(tab.name)
        hl.innerHTML = highlight(tab.code, ext) + '\n'
        const lines = tab.code.split('\n').length
        const before = tab.code.slice(0, input.selectionStart).split('\n')
        const ln = before.length, col = before[before.length - 1].length + 1
        let g = ''
        for (let i = 1; i <= lines; i++) g += (i === ln ? '<span class="cur">' + i + '</span>' : i) + '\n'
        gutter.innerHTML = g
        footLeft.textContent = 'scratch ● UTF-8 · ' + LANGS[ext][1]
        footRight.textContent = 'Ln ' + ln + ', Col ' + col
        syncScroll()
    }

    function syncScroll() {
        hl.parentElement.scrollTop = input.scrollTop
        hl.parentElement.scrollLeft = input.scrollLeft
        gutter.scrollTop = input.scrollTop
    }

    function show() {
        const tab = activeTab()
        if (!tab) {
            state.active = 'engineer'
            staticPane.hidden = false
            editor.hidden = true
            footLeft.textContent = 'main ● UTF-8 · TypeScript'
            footRight.textContent = '✓ 0 problems'
        } else {
            staticPane.hidden = true
            editor.hidden = false
            if (input.value !== tab.code) input.value = tab.code
            renderEditor()
        }
        renderTabs()
    }

    // --- actions ---
    function addTab() {
        if (state.tabs.length >= MAX_TABS) return
        state.seq += 1
        const tab = { id: 't' + Date.now().toString(36) + '-' + state.seq, name: 'untitled-' + state.seq + '.js', code: STARTER }
        state.tabs.push(tab)
        state.active = tab.id
        save()
        show()
        input.focus({ preventScroll: true })
        input.setSelectionRange(tab.code.length, tab.code.length)
        renderEditor()
    }

    function closeTab(id) {
        const i = state.tabs.findIndex(t => t.id === id)
        if (i < 0) return
        state.tabs.splice(i, 1)
        if (state.active === id) {
            const next = state.tabs[i] || state.tabs[i - 1]
            state.active = next ? next.id : 'engineer'
        }
        save()
        show()
    }

    function rename(el, id) {
        const tab = state.tabs.find(t => t.id === id)
        if (!tab) return
        const label = el.querySelector('.cw-name')
        const field = document.createElement('input')
        field.className = 'cw-rename'
        field.value = tab.name
        field.setAttribute('aria-label', 'File name')
        label.replaceWith(field)
        field.focus()
        field.select()
        let done = false
        const commit = keep => {
            if (done) return
            done = true
            const v = field.value.trim().replace(/[\\/:*?"<>|]/g, '').slice(0, 32)
            if (keep && v) tab.name = v
            save()
            show()
        }
        field.addEventListener('keydown', e => {
            e.stopPropagation()
            if (e.key === 'Enter') commit(true)
            if (e.key === 'Escape') commit(false)
        })
        field.addEventListener('blur', () => commit(true))
    }

    addBtn.addEventListener('click', addTab)
    // Mouse wheel scrolls the tab strip sideways when it overflows
    tabsEl.addEventListener('wheel', e => {
        if (tabsEl.scrollWidth <= tabsEl.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
        tabsEl.scrollLeft += e.deltaY
        e.preventDefault()
    }, { passive: false })

    tabsEl.addEventListener('click', e => {
        const tabEl = e.target.closest('.cw-tab')
        if (!tabEl || e.target.closest('.cw-rename')) return
        if (e.target.closest('.cw-close')) { closeTab(tabEl.dataset.id); return }
        if (state.active !== tabEl.dataset.id) { state.active = tabEl.dataset.id; save(); show() }
    })
    tabsEl.addEventListener('dblclick', e => {
        const tabEl = e.target.closest('.cw-tab')
        if (tabEl && tabEl.dataset.id !== 'engineer' && !e.target.closest('.cw-close')) rename(tabEl, tabEl.dataset.id)
    })
    tabsEl.addEventListener('keydown', e => {
        const tabEl = e.target.closest('.cw-tab')
        if (!tabEl || e.target.closest('.cw-rename')) return
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tabEl.click() }
        if (e.key === 'F2' && tabEl.dataset.id !== 'engineer') rename(tabEl, tabEl.dataset.id)
        if (e.key === 'Delete' && tabEl.dataset.id !== 'engineer') closeTab(tabEl.dataset.id)
    })

    let saveTimer
    input.addEventListener('input', () => {
        const tab = activeTab()
        if (!tab) return
        tab.code = input.value
        renderEditor()
        clearTimeout(saveTimer)
        saveTimer = setTimeout(save, 300)
    })
    input.addEventListener('scroll', syncScroll)
    // Older browsers without overflow: clip can still scroll the window on focus
    const win = document.getElementById('codeWindow')
    win.addEventListener('scroll', () => { win.scrollLeft = 0; win.scrollTop = 0 })
    ;['keyup', 'click', 'select'].forEach(ev => input.addEventListener(ev, () => { if (activeTab()) renderEditor() }))

    // Editor keys: Tab indents, Enter keeps indentation, Escape leaves the pad
    const insert = text => {
        // execCommand keeps the browser's undo history; fall back if it is unsupported
        if (!document.execCommand || !document.execCommand('insertText', false, text)) {
            const s = input.selectionStart, en = input.selectionEnd
            input.value = input.value.slice(0, s) + text + input.value.slice(en)
            input.selectionStart = input.selectionEnd = s + text.length
            input.dispatchEvent(new Event('input'))
        }
    }
    input.addEventListener('keydown', e => {
        if (e.key === 'Escape') { input.blur(); return }
        if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); insert('  '); return }
        if (e.key === 'Enter') {
            const lineStart = input.value.lastIndexOf('\n', input.selectionStart - 1) + 1
            const indent = /^[ \t]*/.exec(input.value.slice(lineStart, input.selectionStart))[0]
            const prev = input.value[input.selectionStart - 1]
            e.preventDefault()
            insert('\n' + indent + ('{[(:'.includes(prev) && prev ? '  ' : ''))
        }
    })

    show()
})()
