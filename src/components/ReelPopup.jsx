import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LOGO, PREFERS_REDUCED_MOTION } from '../lib/site.js';
import { CloseIcon, PauseIcon, PlayIcon } from './Icons.jsx';
import { useModalBehaviour } from '../hooks/useModal.js';

/* Project preview opened by clicking a card in the hero reel, or a client
   site in the home story. A card with a `tour` (or, failing that, a `video`)
   plays that short clip of the site. The clip is fetched when the popup opens,
   or earlier for `warm`: the card the visitor is hovering and looks about to
   open, so it plays the moment they click. Until it plays, the clip's own
   first frame stands in. Reduced-motion visitors get the screenshot instead. */
export default function ReelPopup({ card, warm = null, onClose }) {
  const last = useRef(card);
  if (card) last.current = card;
  const c = last.current;
  const open = !!card;
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);

  useModalBehaviour(open, onClose);

  useEffect(() => {
    if (open) return undefined;
    const id = setTimeout(() => {
      last.current = null;
      if (videoRef.current) videoRef.current.currentTime = 0; /* next time it opens on its first frame, not mid-clip */
    }, 400);
    return () => clearTimeout(id);
  }, [open]);

  const hasImg = !!c?.img;
  const media = open ? c : warm || c; /* whose clip is in the <video> */
  const video = (!PREFERS_REDUCED_MOTION && (media?.tour || media?.video)) || null;
  const poster = media?.tour ? media.tourPoster || media.img : media?.img;

  /* Play from the top each time it opens; stop when it closes. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!open) {
      v.pause();
      return;
    }
    setPaused(false);
    v.currentTime = 0;
    const p = v.play();
    if (p && p.catch) p.catch(() => setPaused(true)); /* autoplay refused: the poster and a play button remain */
  }, [open, video]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

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
      <div className={'reel-popup' + (video ? ' reel-popup--video' : '')}>
        <button className="reel-popup-close" id="reelPopupClose" aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </button>
        <div className="reel-popup-img-wrap">
          {video ? (
            <>
              <video
                ref={videoRef}
                src={video}
                poster={poster}
                muted
                loop
                playsInline
                preload={open || warm ? 'auto' : 'none'}
                aria-label={media.name + ' website, video preview'}
              />
              <button type="button" className="reel-popup-play" aria-label={paused ? 'Play preview' : 'Pause preview'} onClick={togglePlay}>
                {paused ? <PlayIcon /> : <PauseIcon />}
              </button>
            </>
          ) : (
            <img
              id="reelPopupImg"
              src={hasImg ? c.img : undefined}
              alt=""
              style={{ display: hasImg ? 'block' : 'none', objectPosition: c?.imgPos || 'top' }}
            />
          )}
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
