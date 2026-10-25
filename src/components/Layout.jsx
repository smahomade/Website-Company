import { useEffect, useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { trackEvent, trackPageView } from '../lib/routeChange.js'; /* not named analytics.js: ad blockers refuse that address, which blanked the page in dev */
import useInteractive from '../hooks/useInteractive.js';
import { PREFERS_REDUCED_MOTION } from '../lib/site.js';

export default function Layout() {
  const { pathname, hash } = useLocation();
  const mainRef = useRef(null);

  /* Scroll to top on route change (or to the #hash target if there is one).
     Layout effect + 'instant': the jump lands before the new page paints, and
     html { scroll-behavior: smooth } can't animate it back through the home
     page's scroll story. */
  useLayoutEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: PREFERS_REDUCED_MOTION ? 'instant' : 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  /* Report the page view once the page's <Seo> has set document.title. */
  useEffect(() => {
    const id = setTimeout(() => trackPageView(pathname, document.title), 0);
    return () => clearTimeout(id);
  }, [pathname]);

  /* Count the clicks that lead to an enquiry: towards the quote form, WhatsApp, email or phone
     (the forms themselves report a lead when they send). */
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      const from = window.location.pathname;
      if (/^\/register(\/|\?|#|$)/.test(href)) trackEvent('quote_click', { from, label: (a.textContent || '').trim().slice(0, 60) });
      else if (href.startsWith('https://wa.me/')) trackEvent('contact_click', { method: 'whatsapp', from });
      else if (href.startsWith('mailto:')) trackEvent('contact_click', { method: 'email', from });
      else if (href.startsWith('tel:')) trackEvent('contact_click', { method: 'phone', from });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  /* Spotlight cards, magnetic buttons and staggered reveals on every page. */
  useInteractive(mainRef, pathname);

  return (
    <>
      <Navbar />
      <main ref={mainRef}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
