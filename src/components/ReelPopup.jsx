import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LOGO } from '../lib/site.js';
import { CloseIcon } from './Icons.jsx';
import { useModalBehaviour } from '../hooks/useModal.js';

/* Project preview opened by clicking a card in the hero reel. */
export default function ReelPopup({ card, onClose }) {
  const last = useRef(card);
  if (card) last.current = card;
  const c = last.current;
  const open = !!card;

  useModalBehaviour(open, onClose);

  useEffect(() => {
    if (open) return undefined;
    const id = setTimeout(() => {
      last.current = null;
    }, 400);
    return () => clearTimeout(id);
  }, [open]);

  const hasImg = !!c?.img;

  return (
    <div
      className={'reel-popup-overlay' + (open ? ' open' : '')}
      id="reelPopupOverlay"
      role="dialog"
      aria-modal="true"
      aria-label="Project preview"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="reel-popup">
        <button className="reel-popup-close" id="reelPopupClose" aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </button>
        <div className="reel-popup-img-wrap">
          <img
            id="reelPopupImg"
            src={hasImg ? c.img : undefined}
            alt=""
            style={{ display: hasImg ? 'block' : 'none', objectPosition: c?.imgPos || 'top' }}
          />
          <div className="reel-popup-img-fallback" id="reelPopupFallback" style={{ display: hasImg ? 'none' : 'flex' }}>
            <img src={LOGO.mark} alt="" />
            <span>Coming Soon</span>
          </div>
        </div>
        <div className="reel-popup-body">
          <div className="reel-popup-meta">
            <span className="reel-popup-tag" id="reelPopupTag">{c?.tag}</span>
            <span className="reel-popup-ind" id="reelPopupInd">{c?.ind}</span>
            <span className="reel-popup-pages" id="reelPopupPages" style={c?.pages ? undefined : { display: 'none' }}>
              {c?.pages || ''}
            </span>
          </div>
          <h3 className="reel-popup-name" id="reelPopupName">{c?.name}</h3>
          <p className="reel-popup-url" id="reelPopupUrl">{c?.url}</p>
          <p className="reel-popup-desc" id="reelPopupDesc">{c?.desc || ''}</p>
          <Link to="/portfolio" className="btn reel-popup-btn" style={{ display: hasImg ? 'inline-flex' : 'none' }}>
            View in Portfolio →
          </Link>
        </div>
      </div>
    </div>
  );
}
