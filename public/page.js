// Shared by the inner pages (CV, web apps, mobile apps): nav border on scroll + footer year
const nav = document.getElementById('nav')
if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
}
const year = document.getElementById('year')
if (year) year.textContent = new Date().getFullYear()
