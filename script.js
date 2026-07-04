/* Website Factory — script.js (multi-page) */

/* ---- Navigation ---- */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

// Set correct state immediately on page load
navbar.classList.toggle('scrolled', window.scrollY > 60);

// Hide on scroll down, reveal on scroll up (like most professional sites)
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 60);

  // Don't hide while the mobile menu is open or near the very top of the page
  const menuOpen = navMenu && navMenu.classList.contains('open');
  if (!menuOpen && y > 140 && y > lastScrollY + 4) {
    navbar.classList.add('nav-hidden');      // scrolling down
  } else if (y < lastScrollY - 4 || y <= 140) {
    navbar.classList.remove('nav-hidden');   // scrolling up (or back near top)
  }
  lastScrollY = y;
}, { passive: true });

if (navToggle) {
  /* Cache the menu's original DOM position so we can restore it on close */
  var menuParent      = navMenu.parentElement;
  var menuNextSibling = navMenu.nextElementSibling;

  function openMenu() {
    /* Portal to <body> — escapes the backdrop-filter containing block on .navbar.scrolled */
    document.body.appendChild(navMenu);
    navMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
    navbar.style.zIndex = '1001'; /* keep navbar (and toggle) above the overlay */
    navToggle.setAttribute('aria-expanded', 'true');
    var spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
  }

  function closeMenu() {
    navMenu.classList.remove('open');
    /* Return menu to its original place inside the navbar */
    menuParent.insertBefore(navMenu, menuNextSibling);
    document.body.style.overflow = '';
    navbar.style.zIndex = '';
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.querySelectorAll('span').forEach(function(s) { s.style.transform = ''; s.style.opacity = ''; });
  }

  navToggle.addEventListener('click', function() {
    navMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  navMenu.addEventListener('click', function(e) {
    if (e.target.classList.contains('nav-link')) closeMenu();
  });
}

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

function applyServiceTab(tab) {
  menuCards.forEach(card => {
    card.classList.toggle('hidden', card.dataset.category !== tab);
  });
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyServiceTab(btn.dataset.tab);
  });
});

const defaultServiceTab = document.querySelector('.tab-btn.active') || tabBtns[0];
if (defaultServiceTab) {
  tabBtns.forEach(b => b.classList.remove('active'));
  defaultServiceTab.classList.add('active');
  applyServiceTab(defaultServiceTab.dataset.tab);
}

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

/* ---- Pricing cards — expand on click ---- */
(function () {
  'use strict';
  var featCur = null;
  window.featPick = function (id) {
    var cards = document.querySelectorAll('.feat-card');
    if (featCur === id) {
      cards.forEach(function (c) { c.classList.remove('feat-active', 'feat-inactive'); });
      featCur = null;
      return;
    }
    featCur = id;
    cards.forEach(function (c) {
      var hit = c.id === id;
      c.classList.toggle('feat-active', hit);
      c.classList.toggle('feat-inactive', !hit);
    });
  };
})();

/* ---- About — reveal on scroll ---- */
(function () {
  var els = document.querySelectorAll('[data-about-reveal]');
  if (!els.length) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('about-visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  els.forEach(function (el) { obs.observe(el); });
})();

/* ---- Portrait card pixel-grid reveal animation ----
   Default: canvas pre-filled with deep-slate (covers image, ghost number shows above).
   Hover:   a soft diagonal wavefront sweeps top-left → bottom-right, fading each
            tile out (revealing the clean image) as it passes through.
   Leave:   the wavefront recedes bottom-right → top-left, fading tiles back in. */
function attachCardPixelFill(card) {
  if (PREFERS_REDUCED) return;
  var canvas = card.querySelector('.hiw-pixel-canvas');
  if (!canvas) return;

  var ctx      = canvas.getContext('2d');
  var TILE     = 18;
  var BG       = '#1B2630'; // must match --deep-slate card background
  var DURATION = 800;       // ms for the full sweep
  var BAND     = 0.32;      // softness of the diagonal wavefront (fraction of diagonal)
  var dpr      = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

  var tiles  = [];   // { x, y, w, h, d }  d = normalised diagonal position 0..1
  var w = 0, h = 0;
  var built  = false;
  var sweep  = 0;    // 0 = fully covered (dark); 1 = fully revealed (image)
  var target = 0;
  var rafId  = null;
  var lastT  = 0;

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function build() {
    w = card.clientWidth; h = card.clientHeight;
    if (!w || !h) return false;
    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Use actual last-tile positions so d never exceeds 1
    var lastX = Math.floor((w - 1) / TILE) * TILE;
    var lastY = Math.floor((h - 1) / TILE) * TILE;
    var maxD  = lastX + lastY || 1;
    tiles = [];
    for (var x = 0; x < w; x += TILE) {
      for (var y = 0; y < h; y += TILE) {
        tiles.push({
          x: x, y: y,
          w: Math.min(TILE, w - x),
          h: Math.min(TILE, h - y),
          d: (x + y) / maxD   // 0 at top-left, 1 at bottom-right
        });
      }
    }
    return true;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = BG;
    var s = easeInOut(sweep);
    for (var i = 0; i < tiles.length; i++) {
      var t = tiles[i];
      // reveal amount: 0 = covered (dark), 1 = cleared (image visible)
      var r = (s * (1 + BAND) - t.d) / BAND;
      var alpha = 1 - (r < 0 ? 0 : r > 1 ? 1 : r);
      if (alpha <= 0) continue;
      ctx.globalAlpha = alpha;
      ctx.fillRect(t.x, t.y, t.w, t.h);
    }
    ctx.globalAlpha = 1;
  }

  function tick(now) {
    if (!lastT) lastT = now;
    var step = (now - lastT) / DURATION;
    lastT = now;
    if (sweep < target)      sweep = Math.min(target, sweep + step);
    else if (sweep > target) sweep = Math.max(target, sweep - step);
    draw();
    if (sweep !== target) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      lastT = 0;
    }
  }

  function animateTo(tg) {
    if (!built) { built = build(); if (!built) return; }
    target = tg;
    lastT = 0;
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  card._pixelBuild = function () {
    if (!built) { built = build(); if (built) draw(); }
  };

  card.addEventListener('mouseenter', function () { animateTo(1); });
  card.addEventListener('mouseleave', function () { animateTo(0); });
}

/* ---- How It Works — staggered card entrance ---- */
const hiwCards = document.querySelectorAll('.hiw-step-card');
if (hiwCards.length) {
  hiwCards.forEach(card => {
    if (card.classList.contains('hiw-portrait-card')) attachCardPixelFill(card);
  });

  const hiwIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('hiw-visible');
        // Build (pre-fill) canvas now that the card has real dimensions
        if (e.target._pixelBuild) e.target._pixelBuild();
        hiwIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  hiwCards.forEach(card => hiwIO.observe(card));
}

/* ---- Typewriter headings ----
   Each heading gets a reusable, cancellable animateTo(targetLength) that types
   forward or erases backward from wherever it currently sits — exposed via
   el._twAnimateTo so other UI (e.g. the hero reveal toggle) can reverse it. */
document.querySelectorAll('.tw-heading').forEach(function (el) {
  var section  = el.closest('section');
  var reveals  = section ? section.querySelectorAll('[data-tw-reveal]') : [];
  var textEl   = el.querySelector('.tw-text');
  var cursor   = el.querySelector('.tw-cursor');
  var fullText = el.dataset.tw || '';
  var fired    = false;
  var gen      = 0;

  function animateTo(target, onDone) {
    gen += 1;
    var myGen = gen;
    cursor.classList.remove('tw-done');

    function step(len) {
      if (gen !== myGen) return;
      textEl.textContent = fullText.slice(0, len);
      if (len === target) {
        if (target === fullText.length) cursor.classList.add('tw-done');
        if (onDone) onDone();
        return;
      }
      var forward = target > len;
      var delay;
      if (forward) {
        delay = 42 + Math.random() * 28;
        if (fullText[len - 1] === ',') delay += 160;
      } else {
        delay = 22;
      }
      setTimeout(function () { step(len + (forward ? 1 : -1)); }, delay);
    }
    step(textEl.textContent.length);
  }

  el._twAnimateTo = animateTo;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !fired) {
        fired = true;
        io.disconnect();
        setTimeout(function () {
          animateTo(fullText.length, function () {
            // reveal any marked content once typing is complete
            reveals.forEach(function (r) {
              setTimeout(function () { r.classList.add('visible'); }, 300);
            });
          });
        }, 200);
      }
    });
  }, { threshold: 0.4 });

  io.observe(el);
});

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
  'starter-one-off': {
    icon: '💻',
    tag: 'Starter · One-Off',
    title: 'Starter Build',
    price: 'From £299',
    desc: 'A clean single-page website built to your brand — handed over to you as finished files with full ownership.',
    meta: [
      { icon: '👤', text: 'Ideal for: freelancers, sole traders, new businesses' },
    ],
    features: [
      { text: '1-page website covering all key sections', type: 'standard' },
      { text: 'Fully mobile-responsive design', type: 'standard' },
      { text: 'Enquiry / contact form', type: 'standard' },
      { text: 'Google Maps embed', type: 'standard' },
      { text: 'Basic on-page SEO setup', type: 'standard' },
      { text: 'Source files handed over on completion', type: 'standard' },
    ],
    note: 'Hosting and domain are not included. You arrange your own after delivery.'
  },
  'starter-manage': {
    icon: '📦',
    tag: 'Starter · Managed',
    title: 'Starter — We Manage',
    price: '£35/mo (was £59)',
    desc: 'We build your site, put it live, and keep everything running — you just focus on your business.',
    deal: '<strong style="display:block;margin-bottom:5px;">🏷️ Limited Deal — save £35/mo</strong>£100 deposit to start · £150 when your site goes live · then £35/mo from one month after. Total build cost: £250.',
    meta: [
      { icon: '👤', text: 'Ideal for: busy owners who want zero tech hassle' },
      { icon: '🔄', text: 'Rolling monthly — cancel anytime' },
    ],
    features: [
      { text: '1-page website, professionally designed', type: 'standard' },
      { text: 'Mobile-responsive design', type: 'standard' },
      { text: 'Contact form & Google Maps', type: 'standard' },
      { text: 'Hosting included', type: 'bonus' },
      { text: 'Domain setup handled', type: 'bonus' },
      { text: 'Minor text & image updates on request', type: 'bonus' },
      { text: 'Security & uptime monitoring', type: 'bonus' },
    ],
    note: '* Minor changes handled within 48 hours. Structural redesigns are not included in this tier.'
  },
  'starter-plus': {
    icon: '🚀',
    tag: 'Starter+ · Priority',
    title: 'Starter+ — Priority',
    price: 'From £99/mo',
    desc: 'Everything in Managed, with faster turnarounds and bigger change requests welcome.',
    deal: '💰 £100 deposit to start · £150 when your site goes live · then £99/mo from one month after launch. Priority support + all change requests included.',
    meta: [
      { icon: '⚡', text: 'Changes turned around under 48 hours' },
      { icon: '🔄', text: 'Rolling monthly — cancel anytime' },
    ],
    features: [
      { text: '1-page website, professionally designed', type: 'standard' },
      { text: 'Mobile-responsive design', type: 'standard' },
      { text: 'Contact form & Google Maps', type: 'standard' },
      { text: 'Hosting included', type: 'bonus' },
      { text: 'Domain setup & configuration', type: 'bonus' },
      { text: 'Major AND minor changes — under 48 hours', type: 'priority' },
      { text: 'Priority support queue', type: 'priority' },
    ],
    note: '* 48-hour SLA applies during UK business hours. Weekend requests count from the next working day.'
  },
  'starter-plus-plus-plus': {
    icon: '🧩',
    tag: 'Starter+++ · Backend',
    title: 'Starter+++ — Backend',
    price: 'From £189/mo',
    desc: 'All priority management perks, plus ongoing backend features like user accounts and login flows.',
    deal: '💰 £100 deposit to start · £150 when your site goes live · then £189/mo from one month after launch. Backend development + full priority management included.',
    meta: [
      { icon: '⚡', text: 'Changes under 48 hours' },
      { icon: '⚙', text: 'Backend features supported' },
    ],
    features: [
      { text: '1-page website, professionally designed', type: 'standard' },
      { text: 'Mobile-responsive design', type: 'standard' },
      { text: 'Contact form & Google Maps', type: 'standard' },
      { text: 'Hosting included', type: 'bonus' },
      { text: 'Domain setup & configuration', type: 'bonus' },
      { text: 'Major & minor changes — under 48 hours', type: 'priority' },
      { text: 'Login / register user account system', type: 'backend' },
      { text: 'Backend dashboard or data features', type: 'backend' },
    ],
    note: '* Backend features are scoped before work begins. Complex features may be quoted separately.'
  },
  'business-one-off': {
    icon: '🏢',
    tag: 'Business · One-Off',
    title: 'Business Build',
    price: 'From £999',
    desc: 'A structured multi-page site for your business — built to your brand and handed over in full.',
    meta: [
      { icon: '📄', text: '3–6 pages included' },
      { icon: '👤', text: 'Ideal for: established businesses needing a proper web presence' },
    ],
    features: [
      { text: '3–6 page website (Home, Services, About, Contact + more)', type: 'standard' },
      { text: 'Mobile-responsive design throughout', type: 'standard' },
      { text: 'Enquiry / contact form', type: 'standard' },
      { text: 'Google Maps embed', type: 'standard' },
      { text: 'On-page SEO for every page', type: 'standard' },
      { text: 'Source files handed over on completion', type: 'standard' },
    ],
    note: 'Hosting and domain are not included. You arrange your own after delivery.'
  },
  'business-manage': {
    icon: '📦',
    tag: 'Business · Managed',
    title: 'Business — We Manage',
    price: 'From £129/mo',
    desc: 'Your full business site built, hosted, and managed end-to-end — zero tech hassle for you.',
    deal: '💰 Build fee quoted on request. Monthly management from £129/mo — hosting, domain, updates, and security monitoring all bundled in.',
    meta: [
      { icon: '📄', text: '3–6 pages included' },
      { icon: '🔄', text: 'Rolling monthly — cancel anytime' },
    ],
    features: [
      { text: '3–6 page website across all key sections', type: 'standard' },
      { text: 'Mobile-responsive design', type: 'standard' },
      { text: 'Contact form & Google Maps', type: 'standard' },
      { text: 'Hosting included', type: 'bonus' },
      { text: 'Domain setup handled', type: 'bonus' },
      { text: 'Minor text & image updates on request', type: 'bonus' },
      { text: 'Security & uptime monitoring', type: 'bonus' },
    ],
    note: '* Minor changes handled within 48 hours. New pages or structural redesigns are not included in this tier.'
  },
  'business-plus': {
    icon: '🚀',
    tag: 'Business+ · Priority',
    title: 'Business+ — Priority',
    price: 'From £199/mo',
    desc: 'Full business site management with priority turnarounds on all change requests.',
    deal: '💰 Build fee quoted on request. Priority management from £199/mo — all change requests turned around under 48 hours across your full business site.',
    meta: [
      { icon: '⚡', text: 'Changes under 48 hours' },
      { icon: '📄', text: '3–6 pages included' },
    ],
    features: [
      { text: '3–6 page website across all key sections', type: 'standard' },
      { text: 'Mobile-responsive design', type: 'standard' },
      { text: 'Contact form & Google Maps', type: 'standard' },
      { text: 'Hosting included', type: 'bonus' },
      { text: 'Domain setup & configuration', type: 'bonus' },
      { text: 'Major AND minor changes — under 48 hours', type: 'priority' },
      { text: 'Priority support queue', type: 'priority' },
    ],
    note: '* 48-hour SLA applies during UK business hours. Weekend requests count from the next working day.'
  },
  'business-plus-plus-plus': {
    icon: '🧩',
    tag: 'Business+++ · Backend',
    title: 'Business+++ — Backend',
    price: 'From £299/mo',
    desc: 'Everything in Business+ with backend development included — accounts, admin panels, booking systems and more.',
    deal: '💰 Build fee quoted on request. Full backend management from £299/mo — user accounts, admin panels, priority support and future scaling all included.',
    meta: [
      { icon: '⚡', text: 'Changes under 48 hours' },
      { icon: '⚙', text: 'Backend features included' },
    ],
    features: [
      { text: '3–6 page website across all key sections', type: 'standard' },
      { text: 'Mobile-responsive design', type: 'standard' },
      { text: 'Contact form & Google Maps', type: 'standard' },
      { text: 'Hosting included', type: 'bonus' },
      { text: 'Domain setup & configuration', type: 'bonus' },
      { text: 'Major & minor changes — under 48 hours', type: 'priority' },
      { text: 'Login / register user account system', type: 'backend' },
      { text: 'Admin panel or data dashboard', type: 'backend' },
    ],
    note: '* Backend features are scoped before work begins. Complex integrations may be quoted separately.'
  },
  'custom-support': {
    icon: '🛠️',
    tag: 'Custom · Support',
    title: 'Help With Your Existing Site',
    desc: 'Already have a website? We can jump in and help — fixes, redesigns, speed improvements, or general tidying up.',
    meta: [
      { icon: '👤', text: 'Ideal for: businesses with an existing site needing work' },
      { icon: '📅', text: 'Timelines quoted per project' },
    ],
    features: [
      { text: 'Bug fixes and technical issues resolved', type: 'standard' },
      { text: 'Design and layout improvements', type: 'standard' },
      { text: 'Mobile & performance optimisation', type: 'standard' },
      { text: 'Content updates (text, images, pages)', type: 'standard' },
      { text: 'Ongoing maintenance packages available', type: 'bonus' },
      { text: 'Works with most platforms and codebases', type: 'bonus' },
    ],
    note: 'Pricing is quoted after a free review of your current site.'
  },
  'custom-website': {
    icon: '🧰',
    tag: 'Custom · Build',
    title: 'Fully Custom Website',
    desc: 'Something that doesn\'t fit a standard package? We plan, design, and build entirely around your goals.',
    meta: [
      { icon: '👤', text: 'Ideal for: unique projects or complex requirements' },
      { icon: '📄', text: 'Any page count, any features' },
    ],
    features: [
      { text: 'Any number of pages to suit your content', type: 'standard' },
      { text: 'Bespoke design tailored to your brand', type: 'standard' },
      { text: 'Feature planning session included', type: 'standard' },
      { text: 'Built to scale as your business grows', type: 'standard' },
      { text: 'Backend, CMS, or e-commerce if needed', type: 'backend' },
      { text: 'Hosting and domain advice included', type: 'bonus' },
    ],
    note: 'All custom projects start with a free discovery call — fixed price and timeline agreed before any work begins.'
  }
};

const serviceModal   = document.getElementById('serviceModal');
const modalOverlayEl = document.getElementById('modalOverlay');
const modalCloseBtn  = document.getElementById('modalClose');
const modalCloseBtn2 = document.getElementById('modalClose2');

function openServiceModal(key) {
  const d = modalData[key];
  if (!d || !serviceModal) return;

  const modalPriceEl = document.getElementById('modalPrice');
  const modalMetaEl  = document.getElementById('modalMeta');
  const modalNoteEl  = document.getElementById('modalNote');
  const modalDealEl  = document.getElementById('modalDeal');

  document.getElementById('modalIcon').textContent  = d.icon;
  document.getElementById('modalTag').textContent   = d.tag;
  document.getElementById('modalTitle').textContent = d.title;

  modalPriceEl.textContent = d.price || '';
  modalPriceEl.style.display = d.price ? '' : 'none';

  document.getElementById('modalDesc').innerHTML = d.desc;

  // Deal banner
  if (modalDealEl) {
    modalDealEl.innerHTML = d.deal || '';
  }

  // Meta pills
  if (modalMetaEl) {
    modalMetaEl.innerHTML = d.meta
      ? d.meta.map(m => `<span class="meta-pill">${m.icon} ${m.text}</span>`).join('')
      : '';
  }

  // Features with type classes
  document.getElementById('modalFeatures').innerHTML = (d.features || []).map(f => {
    const typeClass = f.type === 'bonus' ? ' feat-bonus'
                    : f.type === 'priority' ? ' feat-priority'
                    : f.type === 'backend' ? ' feat-backend'
                    : '';
    return `<li class="${typeClass.trim()}">${f.text}</li>`;
  }).join('');

  // Note
  if (modalNoteEl) modalNoteEl.innerHTML = d.note || '';

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
if (modalCloseBtn2) modalCloseBtn2.addEventListener('click', closeServiceModal);
if (modalOverlayEl) modalOverlayEl.addEventListener('click', closeServiceModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeServiceModal(); });

/* ---- Work Showcase Carousel ---- */
(function () {
  const track    = document.getElementById('showcaseTrack');
  const prevBtn  = document.getElementById('showcasePrev');
  const nextBtn  = document.getElementById('showcaseNext');
  const dotsWrap = document.getElementById('showcaseDots');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.showcase-card'));
  let current = 0;

  function perView() {
    if (window.innerWidth < 600) return 1;
    if (window.innerWidth < 960) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, cards.length - perView());
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'showcase-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    const cardWidth = cards[0].offsetWidth + 24; // card + gap
    track.style.transform = 'translateX(' + (-current * cardWidth) + 'px)';
    if (dotsWrap) {
      dotsWrap.querySelectorAll('.showcase-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current >= maxIndex();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { buildDots(); goTo(Math.min(current, maxIndex())); }, 120);
  });

  buildDots();
  goTo(0);
})();

/* ---- Pixel-grid hover effect (shared) ---- */
var PREFERS_REDUCED = window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function hexToRgba(hex, a) {
  var h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  var n = parseInt(h, 16);
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}

function attachPixelHover(card, body, accent) {
  if (PREFERS_REDUCED || !body) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'reel-pixels';
  canvas.setAttribute('aria-hidden', 'true');
  body.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  var GAP = 7;
  var dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  var colors = [
    'rgba(95,233,226,0.85)',
    'rgba(22,199,192,0.80)',
    'rgba(127,227,228,0.85)',
    'rgba(255,255,255,0.80)'
  ];
  if (accent && /^#/.test(accent)) colors[0] = hexToRgba(accent, 0.85);

  var pixels = [];
  var built = false;
  var raf = null;
  var mode = 'appear';

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function build() {
    var w = body.clientWidth, h = body.clientHeight;
    if (!w || !h) return false;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pixels = [];
    for (var x = 0; x < w; x += GAP) {
      for (var y = 0; y < h; y += GAP) {
        var dx = x, dy = h - y;
        pixels.push({
          x: x, y: y,
          color: colors[(Math.random() * colors.length) | 0],
          size: 0,
          sizeStep: rand(0.2, 0.6),
          maxSize: rand(GAP * 0.5, GAP - 1),
          delay: Math.sqrt(dx * dx + dy * dy) * 0.5,
          counter: 0,
          counterStep: rand(3, 7)
        });
      }
    }
    return true;
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var active = false;
    for (var i = 0; i < pixels.length; i++) {
      var p = pixels[i];
      if (mode === 'appear') {
        if (p.counter <= p.delay) { p.counter += p.counterStep; active = true; }
        else if (p.size < p.maxSize) {
          p.size += p.sizeStep;
          if (p.size > p.maxSize) p.size = p.maxSize;
          active = true;
        }
      } else {
        p.counter = 0;
        if (p.size > 0) { p.size -= 0.22; if (p.size < 0) p.size = 0; active = true; }
      }
      if (p.size > 0) {
        var off = (GAP - p.size) * 0.5;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x + off, p.y + off, p.size, p.size);
      }
    }
    if (!active) {
      cancelAnimationFrame(raf);
      raf = null;
      if (mode === 'disappear') ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function start(m) {
    mode = m;
    if (!built) { built = build(); if (!built) return; }
    if (!raf) raf = requestAnimationFrame(frame);
  }

  card.addEventListener('mouseenter', function () { start('appear'); });
  card.addEventListener('mouseleave', function () { start('disappear'); });
}

/* ---- Hero Reel — auto-advancing interactive card carousel ---- */
(function () {
  var track      = document.getElementById('reelTrack');
  if (!track) return; // not on a page with the hero reel

  var wrap       = document.getElementById('reelWrap');
  var wash       = document.getElementById('heroWash');
  var imgBg      = document.getElementById('heroImgBg');
  var vidBg      = document.getElementById('heroVidBg');
  var orb1       = document.getElementById('orb1');
  var orb2       = document.getElementById('orb2');
  var logoBg      = document.getElementById('heroLogoBg');
  var logoText    = document.getElementById('heroLogoText');
  var infoText   = document.getElementById('infoText');
  var hint       = document.getElementById('reelHint');

  var heroCards = [
    {url:'razaacademy.co.uk',      img:'https://pub-6d3ae22e684b4feaab4ea4d3b9f86c86.r2.dev/screenshots/Raza/raza-academy-banner.JPG', video:'https://pub-6d3ae22e684b4feaab4ea4d3b9f86c86.r2.dev/screenshots/Raza/raza-academy-video.mp4', imgPos:'center 12%', icon:'\ud83c\udfeb', tag:'Redesign', ind:'Education',   pages:'8 pages',   name:'Raza Academy',         desc:'A full redesign for a UK tutoring and home-schooling academy. We rebuilt their site from scratch — cleaner layout, better navigation, and a modern look that reflects the quality of their teaching.',     bg:'linear-gradient(135deg,#06121c,#0a4a4f)', wash:'rgba(22,199,192,0.24)',  orb1:'rgba(95,233,226,0.32)', orb2:'rgba(22,199,192,0.16)',  accent:'#5FE9E2'},
    {url:'topone.co.uk',           img:'https://pub-6d3ae22e684b4feaab4ea4d3b9f86c86.r2.dev/screenshots/TopOne/top-one-banner.JPG', video:'https://pub-6d3ae22e684b4feaab4ea4d3b9f86c86.r2.dev/screenshots/TopOne/top-one-video.mp4',       imgPos:'center top',  icon:'\u2702\ufe0f', tag:'Custom',   ind:'Beauty & Hair', pages:'40+ pages', name:'Top One Salon',        desc:'A premium custom build for one of London\'s top hair and beauty salons. Multi-page, fully responsive, with dedicated sections for services, team, gallery, and bookings.',                                   bg:'linear-gradient(135deg,#0d0f10,#243033)', wash:'rgba(199,204,208,0.18)',  orb1:'rgba(199,204,208,0.30)', orb2:'rgba(22,199,192,0.16)', accent:'#C7CDD2'},
    {url:'smithsplumbing.co.uk',  icon:'\ud83d\udd27', tag:'Static',  ind:'Trades',      name:"Smith's Plumbing",     desc:'A clean, fast static website for a local plumbing business. Clear contact details, service areas, and a no-fuss design that gets the phone ringing.',                                                           bg:'linear-gradient(135deg,#04141a,#075055)', wash:'rgba(22,199,192,0.24)',  orb1:'rgba(95,233,226,0.30)',  orb2:'rgba(22,199,192,0.15)',  accent:'#5FE9E2'},
    {url:'bloomflorist.co.uk',    icon:'\ud83d\uded2', tag:'Dynamic', ind:'E-commerce',  name:'Bloom Florist',        desc:'A dynamic e-commerce site for an independent florist — complete with a product catalogue, seasonal collections, and a smooth checkout experience built to drive online orders.',                                    bg:'linear-gradient(135deg,#051a1c,#0a5a5e)', wash:'rgba(22,199,192,0.22)', orb1:'rgba(127,227,228,0.30)', orb2:'rgba(22,199,192,0.15)', accent:'#7FE3E4'},
  ];

  var N         = heroCards.length;
  var CARD_W    = 190;
  var GAP       = -28; // cards overlap (negative margins) for a tight coverflow
  var CARD_STEP = CARD_W + GAP;
  var SETS      = 3;
  var trackIdx  = N; // start at middle set, card 0
  var realIdx   = 0;
  var isHeld    = false;
  var timer     = null;

  function buildCards() {
    track.innerHTML = '';
    for (var s = 0; s < SETS; s++) {
      heroCards.forEach(function (c, i) {
        var el = document.createElement('div');
        el.className = 'reel-card';
        var globalIdx = s * N + i;
        el.dataset.global = globalIdx;
        el.dataset.real   = i;
        var bodyContent = c.img
          ? '<img src="' + c.img + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;object-position:' + (c.imgPos || 'top') + ';">'
          : '<img src="images/logo/pixelborough_pb_transparent_2.png" class="reel-ph-logo" alt=""><span class="ph-text">Coming soon</span>';
        el.innerHTML =
          '<div class="reel-bar"><div class="reel-dots"><i></i><i></i><i></i></div><span class="reel-url">' + c.url + '</span></div>' +
          '<div class="reel-body" style="background:' + c.bg + '">' + bodyContent + '</div>' +
          '<div class="reel-foot"><span class="reel-tag">' + c.tag + '</span><span class="reel-ind">' + c.ind + '</span></div>';
        el.style.cursor = 'pointer';
        el.addEventListener('click', (function (card) {
          return function () { openReelPopup(card); };
        }(c)));
        track.appendChild(el);
      });
    }
  }

  function buildDots() {
    progress.innerHTML = '';
    heroCards.forEach(function (c, i) {
      var d = document.createElement('div');
      d.className = 'prog-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', (function (ri) {
        return function () { pickCard(ri, N + ri); };
      }(i)));
      progress.appendChild(d);
    });
  }

  buildCards();
  buildDots();

  /* ---- Reel popup ---- */
  var reelOverlay = document.getElementById('reelPopupOverlay');
  var reelPopupClose = document.getElementById('reelPopupClose');

  function openReelPopup(c) {
    if (!reelOverlay) return;
    var popupImg      = document.getElementById('reelPopupImg');
    var popupFallback = document.getElementById('reelPopupFallback');
    var popupBtn      = reelOverlay.querySelector('.reel-popup-btn');
    if (c.img) {
      popupImg.src = c.img;
      popupImg.style.objectPosition = c.imgPos || 'top';
      popupImg.style.display = 'block';
      if (popupFallback) popupFallback.style.display = 'none';
      if (popupBtn) popupBtn.style.display = 'inline-flex';
    } else {
      popupImg.src = '';
      popupImg.style.display = 'none';
      if (popupFallback) popupFallback.style.display = 'flex';
      if (popupBtn) popupBtn.style.display = 'none';
    }
    document.getElementById('reelPopupTag').textContent  = c.tag;
    document.getElementById('reelPopupInd').textContent  = c.ind;
    var pagesEl = document.getElementById('reelPopupPages');
    if (pagesEl) { pagesEl.textContent = c.pages || ''; pagesEl.style.display = c.pages ? '' : 'none'; }
    document.getElementById('reelPopupName').textContent = c.name;
    document.getElementById('reelPopupUrl').textContent  = c.url;
    document.getElementById('reelPopupDesc').textContent = c.desc || '';
    reelOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeReelPopup() {
    if (!reelOverlay) return;
    reelOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (reelPopupClose) reelPopupClose.addEventListener('click', closeReelPopup);
  if (reelOverlay) {
    reelOverlay.addEventListener('click', function (e) {
      if (e.target === reelOverlay) closeReelPopup();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeReelPopup();
    });
  }

  function getX(ti) {
    var W = wrap.offsetWidth;
    // GAP is negative (cards overlap via margins); the leading card's left margin
    // (GAP/2) shifts the whole track, so compensate to keep the active card centred.
    return W / 2 - ti * CARD_STEP - CARD_W / 2 - GAP / 2;
  }

  function setPos(ti, instant) {
    if (instant) {
      track.classList.add('instant');
      track.style.transform = 'translateX(' + getX(ti) + 'px)';
      track.offsetHeight; // force reflow
      track.classList.remove('instant');
    } else {
      track.style.transform = 'translateX(' + getX(ti) + 'px)';
    }
  }

  setPos(trackIdx, true);
  markActive(trackIdx);

  function applyTheme(ri) {
    var c = heroCards[ri];
    if (logoBg) logoBg.style.opacity = '0';
    if (c.video && vidBg) {
      imgBg.style.opacity = '0';
      vidBg.style.opacity = '0';
      clearTimeout(vidBg._swapTimer);
      vidBg._swapTimer = setTimeout(function () {
        vidBg.src = c.video;
        vidBg.load();
        vidBg.play();
        vidBg.style.opacity = '1';
      }, 300);
    } else if (c.img && imgBg) {
      vidBg.style.opacity = '0';
      imgBg.style.opacity = '0';
      clearTimeout(imgBg._swapTimer);
      imgBg._swapTimer = setTimeout(function () {
        imgBg.style.backgroundImage    = 'url(' + c.img + ')';
        imgBg.style.backgroundPosition = c.imgPos || 'center top';
        imgBg.style.opacity            = '1';
      }, 300);
    } else {
      vidBg.style.opacity = '0';
      imgBg.style.opacity = '0';
      if (logoBg) {
        if (logoText) {
          logoText.querySelector('.hero-logo-coming-name').textContent = c.name;
        }
        setTimeout(function () { logoBg.style.opacity = '1'; }, 300);
      }
    }

    progress.querySelectorAll('.prog-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === ri);
      d.style.setProperty('--dot-accent', c.accent);
    });
    progress.style.setProperty('--dot-accent', c.accent);
    if (infoText) infoText.textContent = c.name;
  }

  /* Mark exactly one card active (by its unique global index) so the coverflow
     neighbour selectors resolve cleanly and the 3D states animate correctly. */
  function markActive(gi) {
    var ri = ((gi % N) + N) % N;
    var accent = heroCards[ri].accent;
    track.querySelectorAll('.reel-card').forEach(function (el) {
      var on = parseInt(el.dataset.global) === gi;
      el.classList.toggle('active', on);
      if (on) el.style.setProperty('--accent', accent);
    });
  }

  /* Re-centre into the middle buffer set with no visible animation (cards + track
     frozen) once we've drifted to either edge of the 3-set buffer. */
  function resetToMiddle() {
    if (trackIdx >= N * 2) trackIdx -= N;
    else if (trackIdx < N) trackIdx += N;
    else return;
    track.classList.add('instant');
    track.style.transform = 'translateX(' + getX(trackIdx) + 'px)';
    markActive(trackIdx);
    track.offsetHeight; // force reflow so the jump applies instantly
    track.classList.remove('instant');
  }

  /* Manual one-card move (arrows / swipe). Pauses the autoplay, then resumes. */
  function step(dir) {
    clearTimeout(timer);
    isHeld = true;
    trackIdx += dir;
    realIdx   = ((trackIdx % N) + N) % N;
    setPos(trackIdx, false);
    markActive(trackIdx);
    applyTheme(realIdx);
    timer = setTimeout(function () {
      resetToMiddle();
      timer = setTimeout(function () {
        isHeld = false;
        if (infoText) infoText.textContent = heroCards[realIdx].name;
        timer = setTimeout(advance, 400);
      }, 4000);
    }, 1150);
  }

  function advance() {
    if (isHeld) return;
    trackIdx += 1;
    realIdx   = ((trackIdx % N) + N) % N;
    // Slide and switch the active/coverflow state together so they animate as one.
    setPos(trackIdx, false);
    markActive(trackIdx);
    applyTheme(realIdx);
    timer = setTimeout(function () {
      if (trackIdx >= N * 2) resetToMiddle();
      if (!isHeld) timer = setTimeout(advance, 8000);
    }, 1150);
  }

  function pickCard(ri, gi) {
    clearTimeout(timer);
    isHeld = true;

    // Always move forward: find the nearest copy of this card at or ahead of current position
    var copies = [ri, ri + N, ri + 2 * N];
    var targetTrack = copies[copies.length - 1]; // fallback: furthest-ahead copy
    for (var k = 0; k < copies.length; k++) {
      if (copies[k] >= trackIdx) { targetTrack = copies[k]; break; }
    }

    trackIdx = targetTrack;
    realIdx  = ri;
    // Slide and switch the active/coverflow state together.
    setPos(targetTrack, false);
    markActive(targetTrack);
    applyTheme(ri);
    setTimeout(function () {
      // Normalise back to middle set so the loop stays seamless
      if (trackIdx >= N * 2) resetToMiddle();
      // Auto-resume after 4 s
      timer = setTimeout(function () {
        isHeld = false;
        if (infoText) infoText.textContent = heroCards[realIdx].name;
        timer = setTimeout(advance, 400);
      }, 4000);
    }, 1150);
  }

  // Recalculate position on resize
  window.addEventListener('resize', function () { setPos(trackIdx, true); }, { passive: true });

  // Prev / next arrows
  var reelPrev = document.getElementById('reelPrev');
  var reelNext = document.getElementById('reelNext');
  if (reelPrev) reelPrev.addEventListener('click', function () { step(-1); });
  if (reelNext) reelNext.addEventListener('click', function () { step(1); });

  // Touch swipe (tablet & phone) — drag the reel to move it
  var swipeX = null;
  wrap.addEventListener('touchstart', function (e) {
    swipeX = e.touches[0].clientX;
  }, { passive: true });
  wrap.addEventListener('touchend', function (e) {
    if (swipeX === null) return;
    var dx = e.changedTouches[0].clientX - swipeX;
    swipeX = null;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1); // swipe left = next, right = prev
  }, { passive: true });

  // Kick off
  timer = setTimeout(function () {
    markActive(trackIdx);
    applyTheme(realIdx);
    timer = setTimeout(advance, 8000);
  }, 600);
}());

/* ---- Portfolio Slideshow / Compare Modal ---- */
(function () {
  const overlay       = document.getElementById('pfModalOverlay');
  if (!overlay) return;

  const modalTitle    = document.getElementById('pfModalTitle');
  const modalTag      = document.getElementById('pfModalTag');
  const slidesWrap    = document.getElementById('pfModalSlides');
  const dotsWrap      = document.getElementById('pfModalDots');
  const counter       = document.getElementById('pfModalCounter');
  const prevBtn       = document.getElementById('pfModalPrev');
  const nextBtn       = document.getElementById('pfModalNext');
  const closeBtn      = document.getElementById('pfModalClose');
  const compareBar    = document.getElementById('pfCompareBar');
  const compareTrack  = document.getElementById('pfCompareTrack');
  const compareFill   = document.getElementById('pfCompareFill');
  const compareThumb  = document.getElementById('pfCompareThumb');

  let slides          = [];
  let current         = 0;
  let compareMode     = false;
  let projectTitle    = '';
  let compareDragging = false;
  let dragSource      = null; /* 'track' | 'image' */
  let activeDragContent = null;

  /* --------------------------------
     BUILD SLIDES
  -------------------------------- */
  function openModal(card) {
    let rawSlides;
    try { rawSlides = JSON.parse(card.dataset.slides); } catch (e) { return; }
    if (!Array.isArray(rawSlides) || !rawSlides.length) return;
    slides = rawSlides;

    compareMode  = typeof rawSlides[0] === 'object' && 'before' in rawSlides[0];
    projectTitle = card.querySelector('h3')?.textContent.trim() || 'Project';
    modalTag.textContent = card.querySelector('.portfolio-type-tag')?.textContent.trim() || '';

    compareBar.classList.toggle('active', compareMode);

    /* Build slides + dots */
    slidesWrap.innerHTML = '';
    dotsWrap.innerHTML   = '';
    slidesWrap.classList.remove('pf-at-bottom');
    slides.forEach(function (slide, i) {
      const el = document.createElement('div');
      el.className = 'pf-modal-slide' + (i === 0 ? ' active' : '');
      el.appendChild(compareMode ? buildCompare(slide, i) : buildSimple(slide, i));

      /* End-of-page marker — only for simple (non-compare) slides */
      if (!compareMode) {
        const endMarker = document.createElement('div');
        endMarker.className = 'pf-page-end';
        endMarker.innerHTML = '<span>End of page</span>';
        el.appendChild(endMarker);
      }

      /* Hide the bottom fade once the user scrolls to the end */
      el.addEventListener('scroll', function () {
        const atBottom = this.scrollTop + this.clientHeight >= this.scrollHeight - 8;
        slidesWrap.classList.toggle('pf-at-bottom', atBottom);
      }, { passive: true });

      slidesWrap.appendChild(el);

      const dot = document.createElement('button');
      dot.className = 'pf-modal-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to page ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(dot);
    });

    current = 0;
    refreshUI();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function buildSimple(src, i) {
    const img = document.createElement('img');
    img.src     = src;
    img.alt     = projectTitle + ' — page ' + (i + 1);
    img.loading = 'lazy';
    return img;
  }

  function buildCompare(data, i) {
    const wrap = document.createElement('div');
    wrap.className = 'pf-compare-content';

    /* Spacer sets the container height once both images are measured */
    const spacer = document.createElement('div');
    spacer.className = 'pf-compare-spacer';

    /* After — absolutely positioned base layer */
    const after = document.createElement('img');
    after.className = 'pf-compare-img-after';
    after.src     = data.after;
    after.alt     = 'After';
    after.loading = 'eager';

    /* Before — absolutely positioned overlay, clipped to show only left portion */
    const before = document.createElement('img');
    before.className = 'pf-compare-img-before';
    before.src     = data.before;
    before.alt     = 'Before';
    before.loading = 'eager';
    before.style.clipPath = 'inset(0 70% 0 0)';
    after.style.clipPath  = 'inset(0 0 0 30%)';

    /* End-of-image markers — one per image, shown at the bottom of whichever ends first */
    const beforeEnd = document.createElement('div');
    beforeEnd.className = 'pf-img-end pf-img-end-before';
    beforeEnd.innerHTML = '<span>Before ends here</span>';
    beforeEnd.style.right = '70%'; /* initial: divider at 30% */

    const afterEnd = document.createElement('div');
    afterEnd.className = 'pf-img-end pf-img-end-after';
    afterEnd.innerHTML = '<span>After ends here</span>';
    afterEnd.style.left = '30%';  /* initial: divider at 30% */

    /* Once both images load, size the spacer and position the end marker */
    let loadedCount = 0;
    function onImgLoad() {
      loadedCount++;
      if (loadedCount < 2) return;
      var w = wrap.offsetWidth || 900;
      var bh = before.naturalHeight / before.naturalWidth * w;
      var ah = after.naturalHeight  / after.naturalWidth  * w;
      spacer.style.height = Math.max(bh, ah) + 'px';
      if (bh < ah - 4) {
        beforeEnd.style.top = bh + 'px';
        beforeEnd.classList.add('active');
      } else if (ah < bh - 4) {
        afterEnd.style.top = ah + 'px';
        afterEnd.classList.add('active');
      }
    }
    function tryLoad(img) {
      if (img.complete && img.naturalWidth) { onImgLoad(); }
      else { img.addEventListener('load', onImgLoad); }
    }
    tryLoad(before);
    tryLoad(after);

    /* Vertical divider line */
    const line = document.createElement('div');
    line.className = 'pf-compare-divider';
    line.style.left = '50%';

    /* Corner labels */
    const lblB = document.createElement('span');
    lblB.className   = 'pf-compare-label pf-compare-label-before';
    lblB.textContent = 'Before';

    const lblA = document.createElement('span');
    lblA.className   = 'pf-compare-label pf-compare-label-after';
    lblA.textContent = 'After';

    wrap.append(spacer, after, before, beforeEnd, afterEnd, line, lblB, lblA);
    return wrap;
  }

  /* --------------------------------
     DIVIDER CONTROL
  -------------------------------- */
  function setDivider(pct) {
    pct = Math.min(96, Math.max(4, pct));
    /* Update bar */
    compareFill.style.width  = pct + '%';
    compareThumb.style.left  = pct + '%';
    /* Update active slide */
    const activeSlide = slidesWrap.querySelector('.pf-modal-slide.active');
    if (!activeSlide) return;
    const beforeImg = activeSlide.querySelector('.pf-compare-img-before');
    const afterImg  = activeSlide.querySelector('.pf-compare-img-after');
    const divLine   = activeSlide.querySelector('.pf-compare-divider');
    if (beforeImg) beforeImg.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
    if (afterImg)  afterImg.style.clipPath  = 'inset(0 0 0 ' + pct + '%)';
    if (divLine)   divLine.style.left = pct + '%';
    /* Keep end-marker bands confined to their own side of the divider */
    const beforeEndEl = activeSlide.querySelector('.pf-img-end-before');
    const afterEndEl  = activeSlide.querySelector('.pf-img-end-after');
    if (beforeEndEl) beforeEndEl.style.right = (100 - pct) + '%';
    if (afterEndEl)  afterEndEl.style.left   = pct + '%';
  }

  function pctFromTrack(clientX) {
    const r = compareTrack.getBoundingClientRect();
    return (clientX - r.left) / r.width * 100;
  }

  function pctFromContent(content, clientX) {
    const r = content.getBoundingClientRect();
    return (clientX - r.left) / r.width * 100;
  }

  /* -- Compare bar drag -- */
  compareTrack.addEventListener('mousedown', function (e) {
    compareDragging = true;
    dragSource = 'track';
    setDivider(pctFromTrack(e.clientX));
    e.preventDefault();
  });
  compareTrack.addEventListener('touchstart', function (e) {
    compareDragging = true;
    dragSource = 'track';
    setDivider(pctFromTrack(e.touches[0].clientX));
  }, { passive: true });

  /* -- Drag on image -- */
  slidesWrap.addEventListener('mousedown', function (e) {
    if (!compareMode) return;
    const content = e.target.closest('.pf-compare-content');
    if (!content) return;
    compareDragging   = true;
    dragSource        = 'image';
    activeDragContent = content;
    setDivider(pctFromContent(content, e.clientX));
    e.preventDefault();
  });
  slidesWrap.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
    if (!compareMode) return;
    const content = e.target.closest('.pf-compare-content');
    if (content) {
      activeDragContent = content;
      compareDragging   = true;
      dragSource        = 'image';
    }
  }, { passive: true });

  /* -- Global move / up -- */
  document.addEventListener('mousemove', function (e) {
    if (!compareDragging) return;
    if (dragSource === 'track') setDivider(pctFromTrack(e.clientX));
    else if (activeDragContent) setDivider(pctFromContent(activeDragContent, e.clientX));
  });
  document.addEventListener('mouseup', function () {
    compareDragging   = false;
    dragSource        = null;
    activeDragContent = null;
  });
  document.addEventListener('touchmove', function (e) {
    if (!compareDragging) return;
    const x = e.touches[0].clientX;
    if (dragSource === 'track') setDivider(pctFromTrack(x));
    else if (activeDragContent) setDivider(pctFromContent(activeDragContent, x));
  }, { passive: true });
  document.addEventListener('touchend', function () {
    compareDragging   = false;
    dragSource        = null;
    activeDragContent = null;
  });

  /* --------------------------------
     NAVIGATION
  -------------------------------- */
  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    compareBar.classList.remove('active');
    compareMode = false;
    setTimeout(function () {
      slidesWrap.innerHTML = '';
      dotsWrap.innerHTML   = '';
    }, 360);
  }

  function goTo(index) {
    const allSlides = slidesWrap.querySelectorAll('.pf-modal-slide');
    const allDots   = dotsWrap.querySelectorAll('.pf-modal-dot');
    allSlides[current]?.classList.remove('active');
    allDots[current]?.classList.remove('active');
    current = ((index % slides.length) + slides.length) % slides.length;
    allSlides[current]?.classList.add('active');
    allDots[current]?.classList.add('active');
    allSlides[current].scrollTop = 0;
    slidesWrap.classList.remove('pf-at-bottom'); /* reset fade for new slide */
    refreshUI();
  }

  function refreshUI() {
    const single = slides.length <= 1;
    prevBtn.classList.toggle('pf-hidden', single);
    nextBtn.classList.toggle('pf-hidden', single);
    dotsWrap.style.display = single ? 'none' : 'flex';
    const stage = overlay.querySelector('.pf-modal-stage');
    if (stage) stage.classList.toggle('pf-single', single);

    if (compareMode) {
      const label = slides[current]?.label || ('Page ' + (current + 1));
      modalTitle.textContent = projectTitle + ' — ' + label;
      setDivider(30); /* 30% before / 70% after — reset on every page */
    } else {
      modalTitle.textContent = projectTitle;
    }
    counter.textContent = slides.length > 1 ? (current + 1) + ' / ' + slides.length : '';
  }

  /* -- Slide swipe (disabled in compare mode) -- */
  let touchStartX = 0;
  slidesWrap.addEventListener('touchend', function (e) {
    if (compareMode) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
  }, { passive: true });

  /* -- Keyboard -- */
  prevBtn.addEventListener('click',  function () { goTo(current - 1); });
  nextBtn.addEventListener('click',  function () { goTo(current + 1); });
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click',  function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape')     closeModal();
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  /* -- Wire up cards -- */
  document.querySelectorAll('.portfolio-card[data-slides]').forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('.portfolio-live-btn')) return;
      openModal(card);
    });
  });
}());


/* ====================================================
   HIW — Section scroll-reveal with staggered entrance
   ==================================================== */
(function () {
  if (!document.querySelector('.hiw-step-section')) return;

  var ITEMS = [
    '.hiw-step-num',
    '.hiw-step-title-wrap',
    '.hiw-step-intro',
    '.hiw-path-divider',
    '.hiw-path-card',
    '.hiw-pillar',
    '.hiw-completion-note',
    '.hiw-pf-item'
  ].join(', ');

  document.querySelectorAll('.hiw-step-section, .hiw-step-section--alt').forEach(function (section) {
    var els = Array.from(section.querySelectorAll(ITEMS));

    els.forEach(function (el, i) {
      var animCls = 'hiw-anim';

      if (el.classList.contains('hiw-path-card')) {
        var cards = Array.from(el.closest('.hiw-paths').querySelectorAll('.hiw-path-card'));
        animCls = cards.indexOf(el) === 0 ? 'hiw-anim-left' : 'hiw-anim-right';
      } else if (el.classList.contains('hiw-pf-item')) {
        var items = Array.from(section.querySelectorAll('.hiw-pf-item'));
        animCls = items.indexOf(el) === 0 ? 'hiw-anim-left' : 'hiw-anim-right';
      }

      el.classList.add(animCls);
      el.style.setProperty('--anim-delay', (i * 0.08) + 's');
    });

    var obs = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      section.querySelectorAll('.hiw-anim, .hiw-anim-left, .hiw-anim-right')
             .forEach(function (el) { el.classList.add('is-visible'); });
      obs.disconnect();
    }, { threshold: 0.08 });

    obs.observe(section);
  });
}());

/* ── FAQ accordion ── */
(function () {
  document.querySelectorAll('.faq-item').forEach(function (item) {
    item.querySelector('.faq-q').addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(function (o) { o.classList.remove('open'); });
      // Toggle clicked
      if (!isOpen) item.classList.add('open');
    });
  });
}());

/* ====================================================
   REGISTER / QUOTE PAGE
   ==================================================== */
/* =============================================
   register.js — Quote / Register page logic
   ============================================= */

(function () {
  'use strict';

  /* ── Intent chooser ── */
  var radios      = document.querySelectorAll('input[name="intent"]');
  var formNew     = document.getElementById('formNew');
  var formExisting = document.getElementById('formExisting');

  function showForm(intent, scroll) {
    var target = intent === 'new' ? formNew : formExisting;
    var other  = intent === 'new' ? formExisting : formNew;

    if (!target || !other) return;

    other.classList.remove('visible');
    other.style.display = 'none';

    target.style.transition = 'none';
    target.style.opacity    = '0';
    target.style.transform  = 'translateY(22px)';
    target.style.display    = 'block';

    target.offsetHeight; // force reflow

    // Clear inline overrides so CSS transition takes over
    target.style.transition = '';
    target.style.opacity    = '';
    target.style.transform  = '';
    target.classList.add('visible');

    if (scroll !== false) {
      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  }

  radios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      showForm(radio.value);
    });
  });

  // Pre-select "New website" on page load
  var defaultRadio = document.querySelector('input[name="intent"][value="new"]');
  if (defaultRadio) {
    defaultRadio.checked = true;
    showForm('new', false);
  }

  /* ── Package tier toggle ── */
  var pkgTierMap = {
    'Starter':  'tier_starter',
    'Business': 'tier_business',
    'Custom':   'tier_custom'
  };
  var allTierIds = ['tier_starter', 'tier_business', 'tier_custom'];

  document.querySelectorAll('input[name="pkg_category"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      // Hide all tier selectors
      allTierIds.forEach(function (id) {
        var wrap = document.getElementById(id);
        if (wrap) {
          wrap.classList.remove('active');
          var sel = wrap.querySelector('select');
          if (sel) { sel.required = false; sel.value = ''; }
        }
      });

      // Show the matching one
      var targetId = pkgTierMap[radio.value];
      if (targetId) {
        var target = document.getElementById(targetId);
        if (target) {
          target.classList.add('active');
          var sel = target.querySelector('select');
          if (sel) sel.required = true;
        }
      }
    });
  });

  /* ── "Not sure" checkbox — disables tier selection ── */
  var pkgUnsure = document.getElementById('pkg_unsure');
  if (pkgUnsure) {
    pkgUnsure.addEventListener('change', function () {
      allTierIds.forEach(function (id) {
        var wrap = document.getElementById(id);
        if (!wrap) return;
        if (pkgUnsure.checked) {
          wrap.classList.add('tier-disabled');
          var sel = wrap.querySelector('select');
          if (sel) { sel.required = false; }
        } else {
          wrap.classList.remove('tier-disabled');
          // Restore required on the currently active tier
          if (wrap.classList.contains('active')) {
            var sel = wrap.querySelector('select');
            if (sel) sel.required = true;
          }
        }
      });
    });
  }

  /* ── Form submission (replace with real endpoint as needed) ── */
  function handleSubmit(formEl, successId) {
    if (!formEl) return;
    formEl.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic required-field check
      var valid = true;
      formEl.querySelectorAll('[required]').forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = '#ef4444';
          field.addEventListener('input', function () {
            field.style.borderColor = '';
          }, { once: true });
        }
      });

      if (!valid) return;

      // Hide form, show success
      formEl.style.display = 'none';
      var successEl = document.getElementById(successId);
      if (successEl) successEl.style.display = 'block';

      // Scroll success into view
      if (successEl) {
        setTimeout(function () {
          successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 80);
      }
    });
  }

  handleSubmit(document.getElementById('formNewInner'),      'successNew');
  handleSubmit(document.getElementById('formExistingInner'), 'successExisting');

}());

/* ---- Hero reveal toggle — un-blurs the live site, un-types the headline
   (reverse of the typewriter effect), and slides the button itself down to
   sit just above the carousel — then reverses all three when toggled off ---- */
(function () {
  var hero    = document.querySelector('.hero');
  var btn     = document.getElementById('heroRevealBtn');
  if (!hero || !btn) return;

  var label   = btn.querySelector('.hero-reveal-label');
  var icon    = btn.querySelector('.hero-reveal-icon');
  var heading = hero.querySelector('.tw-heading');
  var stage   = hero.querySelector('.hero-info');
  var shift   = 0; // px currently applied via --reveal-shift

  btn.addEventListener('click', function () {
    var revealed = hero.classList.toggle('hero-revealed');
    btn.setAttribute('aria-pressed', revealed ? 'true' : 'false');
    if (label) label.textContent = revealed ? 'Blur it again' : 'Peek at the real thing';
    if (icon)  icon.textContent  = revealed ? '✕' : '👁';

    if (heading && heading._twAnimateTo) {
      var fullLen = (heading.dataset.tw || '').length;
      heading._twAnimateTo(revealed ? 0 : fullLen);
    }

    if (stage) {
      var btnRect   = btn.getBoundingClientRect();
      var naturalTop = btnRect.top - shift; // undo any shift already applied
      if (revealed) {
        var gap      = 20;
        var stageTop = stage.getBoundingClientRect().top;
        shift = (stageTop - btnRect.height - gap) - naturalTop;
      } else {
        shift = 0;
      }
      btn.style.setProperty('--reveal-shift', shift + 'px');
    }
  });
}());

/* ---- About section — ambient atmosphere (aurora glow + drifting light motes) ---- */
(function () {
  var host = document.querySelector('.about-atmosphere');
  if (!host || PREFERS_REDUCED) return;

  var MOTE_COUNT = 16;
  for (var i = 0; i < MOTE_COUNT; i++) {
    var mote = document.createElement('span');
    mote.className = 'about-mote';
    mote.style.setProperty('--x',     (Math.random() * 100).toFixed(1) + '%');
    mote.style.setProperty('--y',     (20 + Math.random() * 70).toFixed(1) + '%');
    mote.style.setProperty('--size',  (3 + Math.random() * 5).toFixed(1) + 'px');
    mote.style.setProperty('--rise',  (60 + Math.random() * 120).toFixed(0) + 'px');
    mote.style.setProperty('--dur',   (10 + Math.random() * 12).toFixed(1) + 's');
    mote.style.setProperty('--delay', (-Math.random() * 20).toFixed(1) + 's');
    host.appendChild(mote);
  }
}());

/* ---- How It Works header scroll animation ---- */
(function () {
  var headers = document.querySelectorAll('.hiw-header');
  if (!headers.length) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('hiw-header--visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });
  headers.forEach(function (h) { obs.observe(h); });
}());
