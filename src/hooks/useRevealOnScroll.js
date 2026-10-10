import { useEffect } from 'react';

/* Adds `addClass` to every element matching `selector` inside `rootRef`
   the first time it scrolls into view. Optionally applies `initialClass`
   up front (e.g. "fade-in" so the CSS starts the element hidden). */
export default function useRevealOnScroll(rootRef, selector, { addClass = 'visible', initialClass = null, threshold = 0.08 } = {}) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const els = Array.from(root.querySelectorAll(selector));
    if (!els.length) return undefined;
    if (initialClass) els.forEach((el) => el.classList.add(initialClass));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(addClass);
            io.unobserve(e.target);
          }
        });
      },
      { threshold }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef, selector, addClass, initialClass, threshold]);
}

/* The generic "fade-in on scroll" set used across every page. */
export const FADE_SELECTOR =
  '.about-text, .about-visual, .feature-card, .pizza-card, ' +
  '.order-card, .testimonial-card, .find-us-info, .map-area, ' +
  '.section-header, .bento-cell, .stat, .info-item, .page-header';

export function useFadeIn(rootRef) {
  useRevealOnScroll(rootRef, FADE_SELECTOR, { addClass: 'visible', initialClass: 'fade-in', threshold: 0.08 });
}
