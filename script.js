/* Website Factory — script.js (multi-page) */

/* ---- Navigation ---- */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
    const [t, m, b] = navToggle.querySelectorAll('span');
    if (open) {
      t.style.transform = 'rotate(45deg) translate(5px,5px)';
      m.style.opacity   = '0';
      b.style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      [t, m, b].forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
}

navMenu && navMenu.querySelectorAll('.nav-link').forEach(link =>
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle && navToggle.setAttribute('aria-expanded', 'false');
    navToggle && navToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  })
);

/* ---- Active nav link — based on current page URL ---- */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link:not(.nav-cta)').forEach(link => {
  const href = link.getAttribute('href').split('#')[0];   // strip any #hash
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

/* ---- Service tabs ---- */
const tabBtns   = document.querySelectorAll('.tab-btn');
const menuCards = document.querySelectorAll('.pizza-card');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    menuCards.forEach(card => {
      card.classList.toggle('hidden', tab !== 'all' && card.dataset.category !== tab);
    });
  });
});

/* ---- Fade-in on scroll ---- */
const fadeEls = document.querySelectorAll(
  '.about-text, .about-visual, .feature-card, .pizza-card, ' +
  '.order-card, .testimonial-card, .find-us-info, .map-area, ' +
  '.section-header, .bento-cell, .stat, .info-item, .page-header'
);
fadeEls.forEach(el => el.classList.add('fade-in'));

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.08 });

fadeEls.forEach(el => io.observe(el));
