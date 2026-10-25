import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LOGO, PREFERS_REDUCED_MOTION } from '../lib/site.js';
import { CloseIcon, PauseIcon, PlayIcon } from './Icons.jsx';
import { useModalBehaviour } from '../hooks/useModal.js';

/* the short clip a card plays, if any: its `tour`, or failing that its `video` */
const clipOf = (k) => (!PREFERS_REDUCED_MOTION && k && (k.tour || k.video)) || null;

/* Project preview opened by clicking a card in the hero reel, or a client
   site in the home story. A card with a clip plays it, and it has to start
   the moment the popup opens, so clips are loaded ahead of time and stay
   loaded: every card in `keep` (the ones this page can open) gets its own
   <video>, parked out of sight until it is the one showing, and so does
   `warm` (the card the visitor is hovering). Until a clip plays, its own
   first frame stands in. Reduced-motion visitors get the screenshot instead. */
export default function ReelPopup({ card, warm = null, keep = null, onClose }) {
  const last = useRef(card);
  if (card) last.current = card;
  const c = last.current;
  const open = !!card;
  const videos = useRef(new Map()); /* card → its <video> */
  const [paused, setPaused] = useState(false);

  useModalBehaviour(open, onClose);

  useEffect(() => {
    if (open) return undefined;
    const id = setTimeout(() => {
      last.current = null;
      videos.current.forEach((v) => {
        v.currentTime = 0; /* next time it opens on its first frame, not mid-clip */
      });
    }, 400);
    return () => clearTimeout(id);
  }, [open]);

  const hasImg = !!c?.img;
  const media = open ? c : warm || c; /* whose clip is showing */
  const video = clipOf(media);
  const clips = [];
  [...(keep || []), media].forEach((k) => {
    if (clipOf(k) && !clips.includes(k)) clips.push(k);
  });

  /* Play from the top each time it opens; stop when it closes. */
  useEffect(() => {
    videos.current.forEach((v, k) => {
      if (!open || k !== media) v.pause();
    });
    const v = videos.current.get(media);
    if (!v || !open) return;
    setPaused(false);
    v.currentTime = 0;
    const p = v.play();
    if (p && p.catch) p.catch(() => setPaused(true)); /* autoplay refused: the first frame and a play button remain */
  }, [open, media]);

  const togglePlay = () => {
    const v = videos.current.get(media);
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
          {clips.map((k) => (
            <video
              key={k.name}
              ref={(el) => {
                if (el) videos.current.set(k, el);
                else videos.current.delete(k);
              }}
              className={k === media ? undefined : 'is-parked'}
              src={clipOf(k)}
              poster={k.tour ? k.tourPoster || k.img : k.img}
              muted
              loop
              playsInline
              preload={open || k === warm || (keep && keep.includes(k)) ? 'auto' : 'none'}
              aria-hidden={k === media ? undefined : true}
              aria-label={k.name + ' website, video preview'}
            />
          ))}
          {video ? (
            <button type="button" className="reel-popup-play" aria-label={paused ? 'Play preview' : 'Pause preview'} onClick={togglePlay}>
              {paused ? <PlayIcon /> : <PauseIcon />}
            </button>
          ) : (
            <img
              id="reelPopupImg"
              src={hasImg ? c.img : undefined}
              alt=""
              style={{ display: hasImg ? 'block' : 'none', objectPosition: c?.imgPos || 'top' }}
            />
          )}
          <div className="reel-popup-img-fallback" id="reelPopupFallback" style={{ display: hasImg ? 'none' : 'flex' }}>
            <img src={LOGO.mark} alt="" width="202" height="205" />
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
