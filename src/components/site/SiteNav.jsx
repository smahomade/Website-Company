import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Logo from './Logo.jsx';

const LINKS = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/services', label: 'Services' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/contact', label: 'Contact' },
];

/* A floating pill bar: cream glass over any page, a little firmer once the page scrolls. On
   phones the links fold into a panel under the bar (Esc, a tap outside or a new page closes it). */
export default function SiteNav() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onDown = (e) => navRef.current && !navRef.current.contains(e.target) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const linkClass = ({ isActive }) =>
    cn(
      'rounded-full px-4 py-2.5 font-display text-[15px] font-semibold transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45',
      isActive ? 'bg-ink/[0.06] text-ink' : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
    );

  return (
    <header className="fixed inset-x-0 top-0 z-[900] px-3 pt-3 leading-normal md:px-5 md:pt-4">
      {/* first stop for keyboard users; out of sight until it has focus */}
      <a
        href="#main"
        className="absolute left-4 top-4 z-10 -translate-y-24 rounded-full bg-ink px-5 py-3 font-display text-sm font-semibold text-cream outline-none transition-transform focus:translate-y-0 focus-visible:ring-[3px] focus-visible:ring-ring/60"
      >
        Skip to content
      </a>
      <nav
        ref={navRef}
        aria-label="Main"
        className={cn(
          'relative mx-auto flex h-[60px] max-w-6xl items-center justify-between gap-4 rounded-full border pl-4 pr-2 backdrop-blur-md transition-[background-color,box-shadow,border-color] duration-300',
          scrolled || open ? 'border-ink/10 bg-cream/95 shadow-md' : 'border-ink/[0.06] bg-cream/90'
        )}
      >
        <Logo />

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} className={linkClass}>{l.label}</NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <Button asChild size="sm" className="hidden h-11 px-5 sm:inline-flex">
            <Link to="/quote">Get a quote</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </Button>
        </div>

        <div
          id="site-menu"
          hidden={!open}
          className="absolute inset-x-0 top-[calc(100%+8px)] rounded-[26px] border border-ink/10 bg-cream p-2 shadow-lg md:hidden"
        >
          <ul>
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn('flex min-h-12 items-center rounded-2xl px-4 font-display text-lg font-semibold', isActive ? 'bg-ink/[0.06] text-ink' : 'text-ink/80 hover:bg-ink/5')
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="mt-2 w-full">
            <Link to="/quote" onClick={() => setOpen(false)}>
              Get a free quote <ArrowRight />
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
