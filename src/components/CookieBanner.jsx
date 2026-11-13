import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getChoice, onAskAgain, setChoice } from '@/lib/consent.js';

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
    <section
      role="region"
      aria-label="Cookie choice"
      className="pf-rise fixed inset-x-3 bottom-3 z-[950] rounded-[22px] border border-ink/10 bg-cream p-5 leading-normal shadow-lg sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[390px]"
      data-state="open"
    >
      <p className="font-display text-lg font-bold text-ink">Can we count your visit?</p>
      <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
        Google Analytics shows us which pages help people find us. It uses cookies, so it only runs if you say yes.{' '}
        <Link to="/privacy" className="font-semibold text-ink underline underline-offset-2 hover:text-orange-ink">
          Privacy and cookies
        </Link>
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button ref={yesRef} variant="dark" onClick={() => answer('yes')}>
          Yes, that’s fine
        </Button>
        <Button variant="dark" onClick={() => answer('no')}>
          No thanks
        </Button>
      </div>
    </section>
  );
}
