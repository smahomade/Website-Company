import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getChoice, onAskAgain, setChoice } from '../lib/consent.js';

/* Asks once whether Google Analytics may run (lib/consent.js), with "No thanks" as easy as yes.
   It appears on the visitor's first scroll, tap or key press rather than on load: a banner
   arriving with the page would become the page's largest paint on phones and hold up its load
   score, and nothing is tracked before the answer anyway. "Cookie settings" opens it again. */
export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  const yesRef = useRef(null);
  const asked = useRef(false);

  useEffect(() => {
    const events = ['scroll', 'pointerdown', 'keydown', 'touchstart'];
    const show = () => {
      events.forEach((e) => window.removeEventListener(e, show, true));
      setOpen(true);
    };
    if (getChoice() === null) events.forEach((e) => window.addEventListener(e, show, { capture: true, passive: true }));
    const stop = onAskAgain(() => {
      asked.current = true;
      setOpen(true);
    });
    return () => {
      events.forEach((e) => window.removeEventListener(e, show, true));
      stop();
    };
  }, []);

  /* asked from a button: move focus here so keyboard users land on the choice */
  useEffect(() => {
    if (open && asked.current) yesRef.current?.focus();
  }, [open]);

  if (!open) return null;
  const answer = (choice) => {
    setChoice(choice);
    asked.current = false;
    setOpen(false);
  };
  return (
    <section className="cookie-banner" role="region" aria-label="Cookie choice">
      <p className="cookie-banner-title">Can we count your visit?</p>
      <p className="cookie-banner-text">
        Google Analytics shows us which pages help people find us. It uses cookies, so it only runs if you say yes.{' '}
        <Link to="/privacy">Privacy and cookies</Link>
      </p>
      <div className="cookie-banner-actions">
        <button type="button" ref={yesRef} className="cookie-btn" onClick={() => answer('yes')}>
          Yes, that’s fine
        </button>
        <button type="button" className="cookie-btn" onClick={() => answer('no')}>
          No thanks
        </button>
      </div>
    </section>
  );
}
