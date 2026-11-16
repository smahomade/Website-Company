/* Light or dark mode. The .dark class on <html> drives the colours (index.css). A small script in
   index.html sets it before the first paint, so a dark-mode visitor never sees a cream flash:
   the visitor's own choice if they've made one, otherwise their device setting. The choice is
   kept in this browser only ('pf-theme', listed on the privacy page). */
const KEY = 'pf-theme';
const CHANGED = 'pf-theme-change';

export function storedTheme() {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export const isDark = () => document.documentElement.classList.contains('dark');

function apply(dark) {
  document.documentElement.classList.toggle('dark', dark);
  window.dispatchEvent(new Event(CHANGED));
}

/* the toggle: remembered, and a soft crossfade rather than the whole screen jumping in one frame
   (instant for anyone who has asked for reduced motion, or a browser without view transitions) */
export function setDark(dark) {
  try {
    window.localStorage.setItem(KEY, dark ? 'dark' : 'light');
  } catch {
    /* private mode: the choice lasts for this visit only */
  }
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.startViewTransition && !reduce) document.startViewTransition(() => apply(dark));
  else apply(dark);
}

/* runs `fn` when the mode changes, including the device switching (only while the visitor hasn't
   chosen); returns a cleanup */
export function onThemeChange(fn) {
  const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const onDevice = (e) => {
    if (!storedTheme()) apply(e.matches);
  };
  window.addEventListener(CHANGED, fn);
  if (media) media.addEventListener('change', onDevice);
  return () => {
    window.removeEventListener(CHANGED, fn);
    if (media) media.removeEventListener('change', onDevice);
  };
}
