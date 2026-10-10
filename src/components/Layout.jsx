import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { trackPageView } from '../lib/analytics.js';
import useInteractive from '../hooks/useInteractive.js';

export default function Layout() {
  const { pathname, hash } = useLocation();
  const mainRef = useRef(null);

  /* Scroll to top on route change (or to the #hash target if there is one). */
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  /* Report the page view once the page's <Seo> has set document.title. */
  useEffect(() => {
    const id = setTimeout(() => trackPageView(pathname, document.title), 0);
    return () => clearTimeout(id);
  }, [pathname]);

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
