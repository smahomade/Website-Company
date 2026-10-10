import { memo, useEffect, useRef } from 'react';
import { HERO_CARDS } from '../data/heroCards.js';
import { LOGO } from '../lib/site.js';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx';

const N = HERO_CARDS.length;
const CARD_W = 190;
const GAP = -28; /* cards overlap (negative margins) for a tight coverflow */
const CARD_STEP = CARD_W + GAP;
const SETS = 3;

/* Auto-advancing coverflow of client sites that lives inside the hero.
   The reel also owns the hero's backdrop layers (blurred video / image /
   logo) and swaps them to match the active card.

   Timing-sensitive DOM work (transforms, the "instant" reflow trick used
   to re-centre the 3-set buffer, per-card active classes) is done
   imperatively inside one effect. React renders the static markup once
   and never rewrites those attributes, so the two never fight. */
function HeroReel({ revealed, onSelect, stageRef }) {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);
  const infoRef = useRef(null);
  const imgBgRef = useRef(null);
  const vidBgRef = useRef(null);
  const vidSharpRef = useRef(null);
  const logoBgRef = useRef(null);
  const logoNameRef = useRef(null);

  const revealedRef = useRef(revealed);
  const syncSharpRef = useRef(() => {});
  const stepRef = useRef(() => {});
  const pickRef = useRef(() => {});

  useEffect(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    const progress = progressRef.current;
    const infoText = infoRef.current;
    const imgBg = imgBgRef.current;
    const vidBg = vidBgRef.current;
    const vidSharp = vidSharpRef.current;
    const logoBg = logoBgRef.current;
    const logoName = logoNameRef.current;

    let trackIdx = N; /* start at middle set, card 0 */
    let realIdx = 0;
    let isHeld = false;
    let timer = null;
    let currentCard = null;
    let swapTimer = null;
    const timeouts = new Set();

    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timeouts.delete(id);
        fn();
      }, ms);
      timeouts.add(id);
      return id;
    };

    function getX(ti) {
      const W = wrap.offsetWidth;
      /* GAP is negative; the leading card's left margin (GAP/2) shifts the
         whole track, so compensate to keep the active card centred. */
      return W / 2 - ti * CARD_STEP - CARD_W / 2 - GAP / 2;
    }

    function setPos(ti, instant) {
      if (instant) {
        track.classList.add('instant');
        track.style.transform = 'translateX(' + getX(ti) + 'px)';
        void track.offsetHeight; /* force reflow */
        track.classList.remove('instant');
      } else {
        track.style.transform = 'translateX(' + getX(ti) + 'px)';
      }
    }

    function markActive(gi) {
      const ri = ((gi % N) + N) % N;
      const accent = HERO_CARDS[ri].accent;
      track.querySelectorAll('.reel-card').forEach((el) => {
        const on = parseInt(el.dataset.global, 10) === gi;
        el.classList.toggle('active', on);
        if (on) el.style.setProperty('--accent', accent);
      });
    }

    function resetSharp() {
      if (!vidSharp) return;
      vidSharp.style.opacity = '0';
      vidSharp.pause();
    }

    /* Sharp-video layer, used only by the "Peek at the real thing" reveal.
       The default backdrop is a pre-blurred file, so the untouched original
       is crossfaded over it. Fetched lazily on first use. */
    function syncSharp() {
      if (!vidSharp || !vidBg) return;
      const src = currentCard && currentCard.video;
      if (!revealedRef.current || !src) {
        resetSharp();
        vidBg.style.opacity = src ? '1' : '0';
        return;
      }
      if (vidSharp.getAttribute('data-src') !== src) {
        vidSharp.setAttribute('data-src', src);
        vidSharp.src = src;
        vidSharp.load();
      }
      const start = () => {
        try {
          vidSharp.currentTime = vidBg.currentTime || 0;
        } catch (err) {
          /* ignore */
        }
        const p = vidSharp.play();
        if (p && p.catch) p.catch(() => {});
        vidSharp.style.opacity = '1';
        vidBg.style.opacity = '0';
      };
      if (vidSharp.readyState >= 1) start();
      else vidSharp.addEventListener('loadedmetadata', start, { once: true });
    }
    syncSharpRef.current = syncSharp;

    function applyTheme(ri) {
      const c = HERO_CARDS[ri];
      currentCard = c;
      if (logoBg) logoBg.style.opacity = '0';
      resetSharp();
      clearTimeout(swapTimer);
      if (c.video && vidBg) {
        imgBg.style.opacity = '0';
        vidBg.style.opacity = '0';
        swapTimer = later(() => {
          vidBg.src = c.videoBlur || c.video;
          vidBg.load();
          const p = vidBg.play();
          if (p && p.catch) p.catch(() => {});
          vidBg.style.opacity = '1';
          syncSharp();
        }, 300);
      } else if (c.img && imgBg) {
        vidBg.style.opacity = '0';
        imgBg.style.opacity = '0';
        swapTimer = later(() => {
          imgBg.style.backgroundImage = 'url(' + c.img + ')';
          imgBg.style.backgroundPosition = c.imgPos || 'center top';
          imgBg.style.opacity = '1';
        }, 300);
      } else {
        vidBg.style.opacity = '0';
        imgBg.style.opacity = '0';
        if (logoBg) {
          if (logoName) logoName.textContent = c.name;
          later(() => {
            logoBg.style.opacity = '1';
          }, 300);
        }
      }

      progress.querySelectorAll('.prog-dot').forEach((d, i) => {
        d.classList.toggle('active', i === ri);
        d.style.setProperty('--dot-accent', c.accent);
      });
      progress.style.setProperty('--dot-accent', c.accent);
      if (infoText) infoText.textContent = c.name;
    }

    /* Re-centre into the middle buffer set with no visible animation once
       we've drifted to either edge of the 3-set buffer. */
    function resetToMiddle() {
      if (trackIdx >= N * 2) trackIdx -= N;
      else if (trackIdx < N) trackIdx += N;
      else return;
      track.classList.add('instant');
      track.style.transform = 'translateX(' + getX(trackIdx) + 'px)';
      markActive(trackIdx);
      void track.offsetHeight;
      track.classList.remove('instant');
    }

    function advance() {
      if (isHeld) return;
      trackIdx += 1;
      realIdx = ((trackIdx % N) + N) % N;
      setPos(trackIdx, false);
      markActive(trackIdx);
      applyTheme(realIdx);
      timer = later(() => {
        if (trackIdx >= N * 2) resetToMiddle();
        if (!isHeld) timer = later(advance, 8000);
      }, 1150);
    }

    function resumeAfterHold() {
      timer = later(() => {
        isHeld = false;
        if (infoText) infoText.textContent = HERO_CARDS[realIdx].name;
        timer = later(advance, 400);
      }, 4000);
    }

    /* Manual one-card move (arrows / swipe). Pauses autoplay, then resumes. */
    function step(dir) {
      clearTimeout(timer);
      isHeld = true;
      trackIdx += dir;
      realIdx = ((trackIdx % N) + N) % N;
      setPos(trackIdx, false);
      markActive(trackIdx);
      applyTheme(realIdx);
      timer = later(() => {
        resetToMiddle();
        resumeAfterHold();
      }, 1150);
    }
    stepRef.current = step;

    function pickCard(ri) {
      clearTimeout(timer);
      isHeld = true;
      /* Always move forward: nearest copy of this card at or ahead of us. */
      const copies = [ri, ri + N, ri + 2 * N];
      let target = copies[copies.length - 1];
      for (let k = 0; k < copies.length; k++) {
        if (copies[k] >= trackIdx) {
          target = copies[k];
          break;
        }
      }
      trackIdx = target;
      realIdx = ri;
      setPos(target, false);
      markActive(target);
      applyTheme(ri);
      later(() => {
        if (trackIdx >= N * 2) resetToMiddle();
        resumeAfterHold();
      }, 1150);
    }
    pickRef.current = pickCard;

    /* Touch swipe on the reel. */
    let swipeX = null;
    const onTouchStart = (e) => {
      swipeX = e.touches[0].clientX;
    };
    const onTouchEnd = (e) => {
      if (swipeX === null) return;
      const dx = e.changedTouches[0].clientX - swipeX;
      swipeX = null;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    };
    wrap.addEventListener('touchstart', onTouchStart, { passive: true });
    wrap.addEventListener('touchend', onTouchEnd, { passive: true });

    const onResize = () => setPos(trackIdx, true);
    window.addEventListener('resize', onResize, { passive: true });

    /* Kick off */
    setPos(trackIdx, true);
    markActive(trackIdx);
    timer = later(() => {
      markActive(trackIdx);
      applyTheme(realIdx);
      timer = later(advance, 8000);
    }, 600);

    return () => {
      timeouts.forEach((id) => clearTimeout(id));
      clearTimeout(timer);
      clearTimeout(swapTimer);
      wrap.removeEventListener('touchstart', onTouchStart);
      wrap.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
      if (vidBg) vidBg.pause();
      if (vidSharp) vidSharp.pause();
    };
  }, []);

  /* The reveal toggle lives in the hero; re-sync the sharp layer when it flips. */
  useEffect(() => {
    revealedRef.current = revealed;
    syncSharpRef.current();
  }, [revealed]);

  const sets = [];
  for (let s = 0; s < SETS; s++) {
    HERO_CARDS.forEach((c, i) => {
      const globalIdx = s * N + i;
      sets.push(
        <div
          key={globalIdx}
          className="reel-card"
          data-global={globalIdx}
          data-real={i}
          style={{ cursor: 'pointer' }}
          onClick={() => onSelect(c)}
        >
          <div className="reel-bar">
            <div className="reel-dots"><i /><i /><i /></div>
            <span className="reel-url">{c.url}</span>
          </div>
          <div className="reel-body" style={{ background: c.bg }}>
            {c.img ? (
              <img
                src={c.img}
                alt=""
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: c.imgPos || 'top' }}
              />
            ) : (
              <>
                <img src={LOGO.mark} className="reel-ph-logo" alt="" />
                <span className="ph-text">Coming soon</span>
              </>
            )}
          </div>
          <div className="reel-foot">
            <span className="reel-tag">{c.tag}</span>
            <span className="reel-ind">{c.ind}</span>
          </div>
        </div>
      );
    });
  }

  return (
    <>
      {/* Backdrop layers (positioned by the hero's CSS) */}
      <div className="hero-img-bg" id="heroImgBg" ref={imgBgRef} />
      <video className="hero-vid-bg" id="heroVidBg" ref={vidBgRef} autoPlay muted loop playsInline />
      <video className="hero-vid-sharp" id="heroVidSharp" ref={vidSharpRef} muted loop playsInline preload="none" />
      <div className="hero-logo-bg" id="heroLogoBg" ref={logoBgRef}>
        <img src={LOGO.mark} alt="" />
        <div className="hero-logo-text" id="heroLogoText">
          <span className="hero-logo-coming-badge">Coming Soon</span>
          <p className="hero-logo-coming-name" ref={logoNameRef} />
        </div>
      </div>
      <div className="hero-wash" id="heroWash" />
      <div className="hero-grid-overlay" />
      <div className="hero-orb hero-orb--1" id="orb1" />
      <div className="hero-orb hero-orb--2" id="orb2" />

      <div className="hero-reel">
        <div className="hero-info" ref={stageRef}>
          <div className="hero-info-inner" id="heroInfo">
            <span id="infoText" ref={infoRef}>Exploring our work</span>
          </div>
        </div>
        <div className="reel-stage">
          <button className="reel-arrow reel-arrow--prev" id="reelPrev" aria-label="Previous website" onClick={() => stepRef.current(-1)}>
            <ChevronLeftIcon size={24} strokeWidth={2} />
          </button>
          <div className="reel-wrap" id="reelWrap" ref={wrapRef}>
            <div className="reel-track" id="reelTrack" ref={trackRef}>
              {sets}
            </div>
          </div>
          <button className="reel-arrow reel-arrow--next" id="reelNext" aria-label="Next website" onClick={() => stepRef.current(1)}>
            <ChevronRightIcon size={24} strokeWidth={2} />
          </button>
        </div>
        <div className="progress" id="progress" ref={progressRef}>
          {HERO_CARDS.map((c, i) => (
            <div key={c.url} className={'prog-dot' + (i === 0 ? ' active' : '')} onClick={() => pickRef.current(i)} />
          ))}
        </div>
        <div className="reel-hint" id="reelHint">Click a card to find out more</div>
      </div>
    </>
  );
}

export default memo(HeroReel);
