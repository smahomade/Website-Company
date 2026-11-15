import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import { WhatsAppIcon } from '@/components/Icons.jsx';
import { CONTACT, TAWK } from '@/lib/site.js';
import { trackEvent } from '@/lib/routeChange.js';

/* Live chat through tawk.to: its AI answers first and hands over to us. tawk.to's script is heavy
   (around 750 KB), so nothing loads until someone taps this button; then tawk.to's own launcher,
   the same size and in the same corner, takes over. Someone who has sent a message before gets
   the chat loaded straight away on later visits, so a reply waiting for them shows.
   The cookie banner ignores taps on this button (data-chat), so opening the chat doesn't bring
   the banner up over it. */
const CHATTED = 'pf-chat';

let loading = null;
function loadTawk() {
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const api = (window.Tawk_API = window.Tawk_API || {});
    window.Tawk_LoadStart = new Date();
    api.customStyle = { zIndex: 940 }; /* under the cookie banner (950), over everything else */
    api.onLoad = () => resolve(api);
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

export default function ChatButton() {
  /* idle → opening → ready (tawk.to's launcher has taken over), or failed (blocked) */
  const [state, setState] = useState('idle');

  useEffect(() => {
    if (!hasChatted()) return;
    loadTawk().then(
      () => setState('ready'),
      () => {}
    );
  }, []);

  const open = () => {
    if (state === 'opening') return;
    trackEvent('chat_open', { from: window.location.pathname });
    setState('opening');
    /* if the script loads but never renders (rare), offer the other ways after a while */
    const slow = setTimeout(() => setState((s) => (s === 'opening' ? 'failed' : s)), 15000);
    loadTawk().then(
      (api) => {
        clearTimeout(slow);
        setState('ready');
        api.maximize();
      },
      () => {
        clearTimeout(slow);
        setState('failed');
      }
    );
  };

  if (state === 'ready') return null;
  const opening = state === 'opening';
  return (
    <div
      data-chat=""
      className="fixed right-5 bottom-5 z-[900] flex flex-col items-end gap-3 print:hidden"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      {state === 'failed' && (
        <div role="alert" className="w-[min(320px,calc(100vw-2rem))] rounded-[20px] border border-ink/10 bg-cream p-4 text-[15px] leading-relaxed text-ink/80 shadow-lg">
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
        className="grid size-[60px] place-items-center rounded-full bg-ink text-cream shadow-lg ring-1 ring-cream/15 transition-colors duration-200 outline-none hover:bg-espresso focus-visible:ring-[3px] focus-visible:ring-ring/60 aria-busy:cursor-progress"
      >
        <MessageCircle aria-hidden="true" className={'size-7 transition-opacity duration-200' + (opening ? ' opacity-50' : '')} strokeWidth={2} />
      </button>
    </div>
  );
}
