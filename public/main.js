/*-------Navigation bar function----*/
function myMenuFunction(){
    var menuBtn = document.getElementById("myNavMenu");

    if(menuBtn.className === "nav-menu"){
        menuBtn.className += " responsive";
    }
    else{
        menuBtn.className="nav-menu";
    }
}




/*-------Add shadow on navigation bar while scrolling----*/
window.onscroll = function() {headerShadow()};

function headerShadow(){
    const navHeader=document.getElementById("header");

    if(document.body.scrollTop > 50 || document.documentElement.scrollTop > 50){
        navHeader.style.boxShadow="0 1px 6px rgba(0, 0, 0, 0.2)";
        navHeader.style.height="70px";
        navHeader.style.lineHeight="70px";
    }
    else{
        navHeader.style.boxShadow="none";
        navHeader.style.height="90px";
        navHeader.style.lineHeight="90px";
    }
}





/*-------Typing Effect----*/
// Typed.js is only loaded on `index.html`, so guard to avoid runtime errors
// on other pages (e.g., WebApp.html / MobileApp.html).
if (typeof Typed !== 'undefined') {
    new Typed(".typedText",{
        strings:["Software Engineer","Full-Stack Developer","UX Designer"],
        loop:true,
        typeSpeed:100,
        backSpeed : 80,
        backDelay:2000
    })
}


/*-------##---Scroll reveal animation--##----*/
// ScrollReveal is provided by pages that load scrollreveal.js.
const currentPage = (window.location && window.location.pathname ? window.location.pathname : '').toLowerCase()
const shouldDisableScrollReveal = currentPage.endsWith('webapp.html') || currentPage.endsWith('mobileapp.html')

if (typeof ScrollReveal !== 'undefined' && !shouldDisableScrollReveal) {
  const sr = ScrollReveal({
      origin: 'top',
      distance: '80px',
      duration: 2000,
      reset: true     
  })

/*-------Home----*/
sr.reveal('.featured-text-card',{})
  sr.reveal('.featured-name',{delay: 100})
  sr.reveal('.featured-text-info',{delay: 200})
  sr.reveal('.featured-text-btn',{delay: 200})
  sr.reveal('.social_icons',{delay: 200})
  sr.reveal('.featured-image',{delay: 300})

/*-------Project Box----*/

sr.reveal('.project-box',{interval: 200})
  sr.reveal('.cv-project',{interval: 150})


/*-------Headings----*/

sr.reveal('.top-header',{})

 /* -- ABOUT INFO & CONTACT INFO -- */
 const srLeft = ScrollReveal({
    origin: 'left',
    distance: '80px',
    duration: 2000,
    reset: true
  })

  srLeft.reveal('.about-info',{delay: 100})
  srLeft.reveal('.contact-info',{delay: 100})
  srLeft.reveal('.timeline',{delay: 100})
  srLeft.reveal('.secondpage-content',{delay: 100})

   /* -- ABOUT SKILLS & FORM BOX -- */
   const srRight = ScrollReveal({
    origin: 'right',
    distance: '80px',
    duration: 2000,
    reset: true
  })
  
  srRight.reveal('.skills-grid',{delay: 100})
  srRight.reveal('.form-control',{delay: 100})
}


/*-------Scroll reveal left_right Animation----*/


/* ----- CHANGE ACTIVE LINK + SCROLL BUTTON VISIBILITY ----- */
  
const sections = document.querySelectorAll('section[id]')
const scrollBtn = document.querySelector('.scroll-btn')

function onScrollHandler() {
  const scrollY = window.scrollY;

  // Active link handling
  sections.forEach(current =>{
    const sectionHeight = current.offsetHeight,
          sectionTop = current.offsetTop - 50,
          sectionId = current.getAttribute('id')
    const link = document.querySelector('.nav-menu a[href*=' + sectionId + ']')
    if(!link) return

    if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) { 
        link.classList.add('active-link')
    }  else {
        link.classList.remove('active-link')
    }
  })

  // Scroll-down button visibility (only near top of page / home)
  if(scrollBtn){
    if(scrollY > 120){
      scrollBtn.style.opacity = '0'
      scrollBtn.style.pointerEvents = 'none'
      scrollBtn.style.transform = 'translateY(10px)'
    }else{
      scrollBtn.style.opacity = '1'
      scrollBtn.style.pointerEvents = 'auto'
      scrollBtn.style.transform = 'translateY(0)'
    }
  }
}

window.addEventListener('scroll', onScrollHandler)

// See more / less toggle (WebApp.html + DesktopApp.html)
document.addEventListener('click', (e) => {
  const btn = e.target.closest?.('.see-more-btn')
  if(!btn) return

  // For real links, allow normal navigation/open-in-new-tab behavior.
  if(btn.tagName === 'A' && btn.getAttribute('href') && btn.getAttribute('href') !== '#') return

  const card = btn.closest('.secondpage-content')
  const preview = card?.querySelector('.content-preview')
  if(!preview) return

  const isExpanded = preview.classList.toggle('is-expanded')
  card.classList.toggle('is-expanded', isExpanded)
  btn.dataset.state = isExpanded ? 'expanded' : 'collapsed'
  btn.textContent = isExpanded ? 'See less' : 'See more'
})



function navigateTo(page) {
    window.location.href = page;
  }

