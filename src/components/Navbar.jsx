import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LOGO } from '../lib/site.js';

const DARK_HERO_ROUTES = new Set(['/', '/how-it-works', '/services', '/portfolio', '/contact', '/register']);

const LINKS = [
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/services', label: 'Services' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  /* Pages without a dark hero (e.g. the 404) get the solid bar from the start */
  const route = pathname.replace(/\/+$/, '') || '/';
  const solid = !(DARK_HERO_ROUTES.has(route) || route.startsWith('/portfolio/'));
  /* scroll state starts unscrolled (as the page's prebuilt HTML is) and is read before the first paint */
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const openRef = useRef(false);
  openRef.current = open;

  /* Frosted bar after 60px; hide on scroll down, reveal on scroll up. */
  useLayoutEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      if (!openRef.current && y > 140 && y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4 || y <= 140) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Lock page scroll while the mobile menu is open. */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  /* Close the menu whenever the route changes. */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const menu = (
    <ul className={'nav-menu' + (open ? ' open' : '')} id="navMenu">
      {LINKS.map((l) => (
        <li key={l.to}>
          <NavLink to={l.to} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            {l.label}
          </NavLink>
        </li>
      ))}
      <li>
        <Link to="/register" className="nav-link nav-cta">Get a Quote</Link>
      </li>
    </ul>
  );

  return (
    <nav
      aria-label="Main"
      className={'navbar' + (scrolled || solid ? ' scrolled' : '') + (hidden ? ' nav-hidden' : '')}
      id="navbar"
      style={open ? { zIndex: 1001 } : undefined}
    >
      <div className="nav-container">
        <Link to="/" className="nav-logo brand-lockup" aria-label="PixelFold home">
          <img src={LOGO.mark} alt="" className="brand-mark" width="202" height="205" />
          <span className="brand-word" aria-hidden="true">PIXEL<i>FOLD</i></span>
        </Link>
        <button
          className="nav-toggle"
          id="navToggle"
          aria-label="Toggle navigation menu"
          aria-expanded={open ? 'true' : 'false'}
          onClick={() => setOpen((o) => !o)}
        >
          <span style={open ? { transform: 'rotate(45deg) translate(5px,5px)' } : undefined} />
          <span style={open ? { opacity: 0 } : undefined} />
          <span style={open ? { transform: 'rotate(-45deg) translate(5px,-5px)' } : undefined} />
        </button>
        {/* When open, the menu is portalled to <body> so it escapes the
            backdrop-filter containing block created by .navbar.scrolled. */}
        {open ? createPortal(menu, document.body) : menu}
      </div>
    </nav>
  );
}
