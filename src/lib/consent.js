import { trackPageView } from './routeChange.js';

/* Google Analytics only runs for visitors who have said yes. The cookie banner (CookieBanner.jsx)
   asks, the answer is kept in this browser, and "Cookie settings" in the footer or on the privacy
   page asks again. Nothing is loaded from Google until the answer is yes. */
export const GA_ID = 'G-J606S9E60Z';
const KEY = 'pf-analytics';
const ASK = 'pf-consent-ask';
const CHANGED = 'pf-consent-changed';

/* 'yes', 'no', or null when they haven't been asked */
export function getChoice() {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setChoice(choice) {
  try {
    window.localStorage.setItem(KEY, choice);
  } catch {
    /* private mode: the choice lasts for this visit only */
  }
  if (choice === 'yes') startAnalytics(true);
  else stopAnalytics();
  window.dispatchEvent(new Event(CHANGED));
}

/* runs `fn` whenever the answer changes (the privacy page shows the current one) */
export const onChoiceChange = (fn) => {
  window.addEventListener(CHANGED, fn);
  return () => window.removeEventListener(CHANGED, fn);
};

/* opens the banner again (footer and privacy page buttons) */
export const askAgain = () => window.dispatchEvent(new Event(ASK));
export const onAskAgain = (fn) => {
  window.addEventListener(ASK, fn);
  return () => window.removeEventListener(ASK, fn);
};

/* Loads gtag.js and sets it up as index.html used to (page views are sent by the router, see
   routeChange.js). `pageView`: also count the page they're on, when they say yes part way in. */
export function startAnalytics(pageView) {
  if (typeof window === 'undefined' || typeof window.gtag === 'function') return;
  window['ga-disable-' + GA_ID] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });
  if (!document.querySelector('script[data-ga]')) {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    s.dataset.ga = '';
    document.head.appendChild(s);
  }
  if (pageView) trackPageView(window.location.pathname, document.title);
}

/* Stops sending (Google's own off switch, and no gtag for routeChange.js to call) and clears the
   _ga cookies, which Google sets on the widest domain it can, so each level is tried. */
function stopAnalytics() {
  window['ga-disable-' + GA_ID] = true;
  window.gtag = undefined;
  const parts = window.location.hostname.split('.');
  const domains = [''];
  for (let i = 0; i < parts.length - 1; i++) domains.push(parts.slice(i).join('.'));
  document.cookie
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid')
    .forEach((name) =>
      domains.forEach((d) => {
        document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=.' + d : '');
      })
    );
}
