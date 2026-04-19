/* Website Factory — script.js (multi-page) */

/* ---- Navigation ---- */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');

window.addEventListener('scroll', () => {
  if (isHomePage) {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
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

/* ---- Portfolio filters ---- */
const portfolioFilterBtns = document.querySelectorAll('.portfolio-filter-btn');
const portfolioCards      = document.querySelectorAll('.portfolio-card');

portfolioFilterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    portfolioFilterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    portfolioCards.forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.type !== filter);
    });
  });
});

/* ---- Service Modal ---- */
const modalData = {
  'static-single': {
    icon: '\ud83d\udcbb',
    tag: 'One-off Payment',
    title: 'Static Website',
    price: 'From \u00a3499',
    desc: 'A fast, secure, hand-coded static website built from scratch around your brand. No bloated CMS, no unnecessary complexity \u2014 just clean HTML & CSS that loads instantly and ranks well on Google.',
    features: [
      'Custom design tailored to your brand',
      'Mobile-friendly & fully responsive',
      'Fast load times \u2014 no database needed',
      'SEO-friendly structure built in',
      'Contact form included',
      'Delivered in 1\u20132 weeks',
      'Full code ownership \u2014 yours to keep'
    ]
  },
  'static-bundle': {
    icon: '\ud83d\udce6',
    tag: 'Bundle \u00b7 Monthly',
    title: 'Static Website + Hosting',
    price: 'From \u00a349/mo',
    desc: 'Everything in the Static Website plan, plus we take care of everything after launch. Your site lives on our reliable hosting and you can request changes whenever you need \u2014 we handle it all, no tech knowledge required.',
    features: [
      'Everything in the Static Website plan',
      'Hosting included \u2014 fully managed',
      'Unlimited change requests',
      'SSL certificate included',
      'Monthly backups',
      'Priority email support'
    ]
  },
  'dynamic-single': {
    icon: '\u2699\ufe0f',
    tag: 'One-off Payment',
    title: 'Dynamic Website',
    price: 'From \u00a3999',
    desc: 'A fully CMS-powered website you can update yourself. Add blog posts, edit pages, change images \u2014 all through an easy-to-use dashboard. No coding skills needed, ever.',
    features: [
      'Custom design + full CMS setup',
      'Blog / news section included',
      'Edit your own content easily',
      'Mobile-friendly & responsive',
      'SEO tools built in',
      'Delivered in 2\u20134 weeks',
      'Full ownership \u2014 yours to keep'
    ]
  },
  'dynamic-bundle': {
    icon: '\ud83d\udce6',
    tag: 'Bundle \u00b7 Monthly',
    title: 'Dynamic Website + Hosting',
    price: 'From \u00a389/mo',
    desc: 'Everything in the Dynamic Website plan, plus we host your site and handle all the technical upkeep. You focus on your business \u2014 we keep everything running and take care of any changes you need.',
    features: [
      'Everything in the Dynamic Website plan',
      'Hosting included \u2014 fully managed',
      'Unlimited change requests',
      'CMS & security updates handled for you',
      'Monthly backups',
      'Priority email support'
    ]
  }
};

const serviceModal   = document.getElementById('serviceModal');
const modalOverlayEl = document.getElementById('modalOverlay');
const modalCloseBtn  = document.getElementById('modalClose');

function openServiceModal(key) {
  const d = modalData[key];
  if (!d || !serviceModal) return;
  document.getElementById('modalIcon').textContent  = d.icon;
  document.getElementById('modalTag').textContent   = d.tag;
  document.getElementById('modalTitle').textContent = d.title;
  document.getElementById('modalPrice').textContent = d.price;
  document.getElementById('modalDesc').textContent  = d.desc;
  document.getElementById('modalFeatures').innerHTML = d.features.map(f => `<li>${f}</li>`).join('');
  serviceModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeServiceModal() {
  if (!serviceModal) return;
  serviceModal.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.read-more-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    openServiceModal(btn.dataset.modal);
  });
});

if (modalCloseBtn)  modalCloseBtn.addEventListener('click', closeServiceModal);
if (modalOverlayEl) modalOverlayEl.addEventListener('click', closeServiceModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeServiceModal(); });
