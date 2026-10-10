import { useEffect } from 'react';
import { PREFERS_REDUCED_MOTION } from '../lib/site.js';

/* Cards that get a cursor-following highlight. */
const SPOT_SELECTOR = [
  '.pizza-card', '.portfolio-card', '.hiw-step-card', '.order-card', '.hiw-path-card',
  '.hiw-pillar', '.contact-info-card', '.feat-card', '.hiw-pf-item', '.intent-card-label',
].join(', ');

/* Buttons that lean towards the cursor. */
const MAGNET_SELECTOR = '.btn-primary, .hiw-btn, .btn-white, .nav-cta, .feat-cta, .btn-submit, .contact-submit';

/* Elements that fade/slide in the first time they scroll into view.
   Items sharing a parent are staggered. Elements that already have their
   own entrance (hiw-step-card, hiw-anim, fade-in) are left alone. */
const REVEAL_SELECTOR = [
  '.portfolio-section-header', '.portfolio-filters', '.menu-tabs',
  '.contact-info-title', '.contact-info-sub', '.contact-info-card', '.contact-reassurance', '.contact-form-wrap',
  '.intent-card', '.register-form-card',
  '.hiw-faq-header', '.faq-item', '.hiw-faq-cta',
  '.hiw-cta', '.features-footer-cta', '.hiw-portfolio-cta',
  '.about-tw-stage',
  '.portfolio-cta-inner',
].join(', ');

/**
 * Site-wide interaction layer:
 *  - spotlight: cards track the pointer through --mx/--my CSS variables
 *  - magnet: primary buttons drift a few px towards the pointer
 *  - reveal: staggered entrance for content the first time it's seen
 * Re-runs on every route change so newly mounted pages are covered.
 */
export default function useInteractive(rootRef, routeKey) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    /* ---- reveal ---- */
    const els = Array.from(root.querySelectorAll(REVEAL_SELECTOR));
    let io = null;
    if (PREFERS_REDUCED_MOTION) {
      els.forEach((el) => el.classList.add('pf-in'));
    } else if (els.length) {
      const groups = new Map();
      els.forEach((el) => {
        el.classList.add('pf-reveal');
        const parent = el.parentElement;
        const n = groups.get(parent) || 0;
        el.style.setProperty('--ri', n);
        groups.set(parent, n + 1);
      });
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('pf-in');
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      els.forEach((el) => io.observe(el));
    }

    /* ---- entrance clean-up ----
       Cards enter with the .pf-pop keyframes. Some cards also swap in a
       different `animation` on hover (the tier glow); if .pf-pop were still
       on the element, leaving would restart the entrance and the card would
       blink. Drop the class as soon as the entrance has played. */
    const onAnimEnd = (e) => {
      if (e.animationName === 'pfPopIn' && e.target.classList) e.target.classList.remove('pf-pop');
    };
    root.addEventListener('animationend', onAnimEnd);

    if (PREFERS_REDUCED_MOTION) {
      return () => {
        if (io) io.disconnect();
        root.removeEventListener('animationend', onAnimEnd);
      };
    }

    /* ---- spotlight + magnet ---- */
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) {
      return () => {
        if (io) io.disconnect();
        root.removeEventListener('animationend', onAnimEnd);
      };
    }

    let raf = null;
    let last = null;
    const apply = () => {
      raf = null;
      const e = last;
      if (!e) return;
      const card = e.target.closest ? e.target.closest(SPOT_SELECTOR) : null;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', e.clientX - r.left + 'px');
        card.style.setProperty('--my', e.clientY - r.top + 'px');
      }
      const btn = e.target.closest ? e.target.closest(MAGNET_SELECTOR) : null;
      if (btn) {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.setProperty('--tx', (dx * 8).toFixed(1) + 'px');
        btn.style.setProperty('--ty', (dy * 6).toFixed(1) + 'px');
      }
    };
    const onMove = (e) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onOut = (e) => {
      const btn = e.target.closest ? e.target.closest(MAGNET_SELECTOR) : null;
      if (btn && !(e.relatedTarget && btn.contains(e.relatedTarget))) {
        btn.style.setProperty('--tx', '0px');
        btn.style.setProperty('--ty', '0px');
      }
    };
    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerout', onOut, { passive: true });
    root.classList.add('pf-interactive');

    return () => {
      if (io) io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerout', onOut);
      root.removeEventListener('animationend', onAnimEnd);
    };
  }, [rootRef, routeKey]);
}
