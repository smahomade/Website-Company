import { useEffect } from 'react';

/* Fades [data-reveal] elements in the first time they scroll into view (styles in index.css).
   Anything already on screen is left alone, so nothing visible ever blinks out; give siblings
   style={{ '--reveal-i': n }} to stagger them. */
export default function useReveal(ref) {
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.removeAttribute('data-hidden');
          io.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    );
    root.querySelectorAll('[data-reveal]').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
      el.setAttribute('data-hidden', '');
      io.observe(el);
    });
    return () => io.disconnect();
  }, [ref]);
}
