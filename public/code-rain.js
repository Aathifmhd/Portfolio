// Background animation shared by every page: code symbols drifting slowly upward.
// Needs an empty <div class="code-rain" id="codeRain"> and engineer.css.
const rain = document.getElementById('codeRain')
if (rain && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const glyphs = ['{ }', '</>', '=>', '( )', '[ ]', ';', '&&', '//', '0 1', '$', '===', '#']
    const count = window.innerWidth < 680 ? 12 : 22
    for (let i = 0; i < count; i++) {
        const s = document.createElement('span')
        s.textContent = glyphs[i % glyphs.length]
        s.style.left = (Math.random() * 96 + 2).toFixed(1) + '%'
        s.style.setProperty('--fs', (12 + Math.random() * 8).toFixed(0) + 'px')
        s.style.setProperty('--dur', (24 + Math.random() * 16).toFixed(1) + 's')
        s.style.setProperty('--delay', (-Math.random() * 40).toFixed(1) + 's')
        s.style.setProperty('--op', (0.16 + Math.random() * 0.12).toFixed(2))
        rain.appendChild(s)
    }
}
