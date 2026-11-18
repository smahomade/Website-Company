import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import { WhatsAppIcon } from '@/components/Icons.jsx';
import { CONTACT, TAWK } from '@/lib/site.js';
import { isBannerOpen, onBannerChange } from '@/lib/consent.js';
import { trackEvent } from '@/lib/routeChange.js';

/* Live chat through tawk.to: its AI answers first and hands over to us. tawk.to's script is heavy
   (around 750 KB), so nothing loads until someone taps this button; then tawk.to's own launcher,
   the same size and in the same corner, takes over. Someone who has sent a message before gets
   the chat loaded straight away on later visits, so a reply waiting for them shows.
   The cookie banner ignores taps on this button (data-chat), so opening the chat doesn't bring
   the banner up over it.
   On phones the banner spans the bottom of the screen, so while it's open this button moves up
   above it. tawk.to's launcher can't be moved once loaded, so while the banner is open it's
   hidden and this button stands in for it, raised the same way. */
const CHATTED = 'pf-chat';
const WINDOW = 'pf-chat-window';
/* below Tailwind's sm: the width where the banner spans the screen (above it, it sits bottom left) */
const NARROW = '(max-width: 639.98px)';

let loading = null;
function loadTawk() {
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const api = (window.Tawk_API = window.Tawk_API || {});
    window.Tawk_LoadStart = new Date();
    /* over the cookie banner (950), so an open chat is never covered by it; its launcher is
       hidden while the banner is up on phones (see above) */
    api.customStyle = { zIndex: 960 };
    api.onLoad = () => resolve(api);
    api.onChatMaximized = () => window.dispatchEvent(new CustomEvent(WINDOW, { detail: true }));
    api.onChatMinimized = () => window.dispatchEvent(new CustomEvent(WINDOW, { detail: false }));
    api.onChatMessageVisitor = () => {
      try {
        window.localStorage.setItem(CHATTED, '1');
      } catch {
        /* private mode: the chat just loads on tap next time */
      }
    };
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://embed.tawk.to/${TAWK.property}/${TAWK.widget}`;
    s.charset = 'UTF-8';
    s.setAttribute('crossorigin', '*');
    s.onerror = () => {
      loading = null;
      s.remove();
      reject(new Error('chat blocked'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

function hasChatted() {
  try {
    return window.localStorage.getItem(CHATTED) === '1';
  } catch {
    return false;
  }
}

/* true while the cookie banner is open across the bottom of a phone screen */
function useBannerInTheWay() {
  const [inTheWay, setInTheWay] = useState(false);
  useEffect(() => {
    const narrow = window.matchMedia(NARROW);
    const update = () => setInTheWay(isBannerOpen() && narrow.matches);
    update();
    const stop = onBannerChange(update);
    narrow.addEventListener('change', update);
    return () => {
      stop();
      narrow.removeEventListener('change', update);
    };
  }, []);
  return inTheWay;
}

export default function ChatButton() {
  /* idle → opening → ready (tawk.to's launcher has taken over), or failed (blocked) */
  const [state, setState] = useState('idle');
  /* whether tawk.to's chat window is open */
  const [chatOpen, setChatOpen] = useState(false);
  const raised = useBannerInTheWay();
  /* tawk.to is loaded but its launcher would sit under the banner: hide it and show this button */
  const standIn = state === 'ready' && raised && !chatOpen;

  useEffect(() => {
    const onWindow = (e) => setChatOpen(e.detail);
    window.addEventListener(WINDOW, onWindow);
    if (hasChatted()) {
      loadTawk().then(
        () => setState('ready'),
        () => {}
      );
    }
    return () => window.removeEventListener(WINDOW, onWindow);
  }, []);

  useEffect(() => {
    if (state !== 'ready') return;
    if (standIn) window.Tawk_API.hideWidget();
    else window.Tawk_API.showWidget();
  }, [state, standIn]);

  const open = () => {
    if (state === 'opening') return;
    trackEvent('chat_open', { from: window.location.pathname });
    if (state === 'ready') {
      setChatOpen(true);
      window.Tawk_API.showWidget();
      window.Tawk_API.maximize();
      return;
    }
    setState('opening');
    /* if the script loads but never renders (rare), offer the other ways after a while */
    const slow = setTimeout(() => setState((s) => (s === 'opening' ? 'failed' : s)), 15000);
    loadTawk().then(
      (api) => {
        clearTimeout(slow);
        setChatOpen(true); /* before tawk.to says so, so its window isn't hidden as it opens */
        setState('ready');
        api.maximize();
      },
      () => {
        clearTimeout(slow);
        setState('failed');
      }
    );
  };

  if (state === 'ready' && !standIn) return null;
  const opening = state === 'opening';
  return (
    <div
      data-chat=""
      className="fixed right-5 bottom-5 z-[900] flex flex-col items-end gap-3 transition-transform duration-300 ease-out motion-reduce:transition-none print:hidden"
      style={{
        marginBottom: 'env(safe-area-inset-bottom)',
        /* the banner sits 12px from the bottom; this lands the button 12px above its top edge */
        transform: raised ? 'translateY(calc(-1 * var(--pf-cookie-h, 0px) - 4px))' : undefined,
      }}
    >
      {state === 'failed' && (
        <div role="alert" className="w-[min(320px,calc(100vw-2rem))] rounded-[20px] border border-ink/10 bg-paper p-4 text-[15px] leading-relaxed text-ink/80 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <p className="font-display font-bold text-ink">The chat didn’t load</p>
            <button
              type="button"
              onClick={() => setState('idle')}
              aria-label="Close"
              className="-mt-1.5 -mr-1.5 grid size-9 shrink-0 place-items-center rounded-full text-ink/60 hover:bg-ink/5 hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>
          <p className="mt-1">Something in this browser may be blocking it. You can reach us these ways instead:</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-semibold text-ink">
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 underline-offset-4 hover:underline">
              <WhatsAppIcon size={16} /> WhatsApp
            </a>
            <Link to="/contact" onClick={() => setState('idle')} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
              Contact form
            </Link>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={open}
        aria-label={opening ? 'Opening the chat' : 'Chat with us'}
        aria-busy={opening}
        title="Chat with us"
        className="grid size-[60px] place-items-center rounded-full bg-coal text-cream shadow-lg ring-1 ring-cream/15 transition-colors duration-200 outline-none hover:bg-espresso focus-visible:ring-[3px] focus-visible:ring-ring/60 aria-busy:cursor-progress"
      >
        <MessageCircle aria-hidden="true" className={'size-7 transition-opacity duration-200' + (opening ? ' opacity-50' : '')} strokeWidth={2} />
      </button>
    </div>
  );
}
