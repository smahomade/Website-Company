import { useCallback, useEffect, useRef, useState } from 'react';
import { useModalBehaviour } from '../hooks/useModal.js';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from './Icons.jsx';

const DEFAULT_PCT = 30; /* 30% before / 70% after */

function clampPct(p) {
  return Math.min(96, Math.max(4, p));
}

/* One before/after slide. The "before" image is clipped to the left of the
   divider, "after" to the right. When the two screenshots differ in height
   an "ends here" band marks where the shorter one stops. */
function CompareSlide({ slide, pct }) {
  const wrapRef = useRef(null);
  const beforeRef = useRef(null);
  const afterRef = useRef(null);
  const [layout, setLayout] = useState({ height: null, beforeEnd: null, afterEnd: null });

  const measure = useCallback(() => {
    const before = beforeRef.current;
    const after = afterRef.current;
    if (!before || !after || !before.naturalWidth || !after.naturalWidth) return;
    const w = wrapRef.current?.offsetWidth || 900;
    const bh = (before.naturalHeight / before.naturalWidth) * w;
    const ah = (after.naturalHeight / after.naturalWidth) * w;
    setLayout({
      height: Math.max(bh, ah),
      beforeEnd: bh < ah - 4 ? bh : null,
      afterEnd: ah < bh - 4 ? ah : null,
    });
  }, []);

  /* Images may already be cached and complete before onLoad fires. */
  useEffect(() => {
    measure();
  }, [measure, slide]);

  return (
    <div className="pf-compare-content" ref={wrapRef}>
      <div className="pf-compare-spacer" style={layout.height ? { height: layout.height } : undefined} />
      <img
        ref={afterRef}
        className="pf-compare-img-after"
        src={slide.after}
        alt="After"
        loading="eager"
        onLoad={measure}
        style={{ clipPath: 'inset(0 0 0 ' + pct + '%)' }}
      />
      <img
        ref={beforeRef}
        className="pf-compare-img-before"
        src={slide.before}
        alt="Before"
        loading="eager"
        onLoad={measure}
        style={{ clipPath: 'inset(0 ' + (100 - pct) + '% 0 0)' }}
      />
      <div
        className={'pf-img-end pf-img-end-before' + (layout.beforeEnd != null ? ' active' : '')}
        style={{ right: 100 - pct + '%', top: layout.beforeEnd != null ? layout.beforeEnd : undefined }}
      >
        <span>Before ends here</span>
      </div>
      <div
        className={'pf-img-end pf-img-end-after' + (layout.afterEnd != null ? ' active' : '')}
        style={{ left: pct + '%', top: layout.afterEnd != null ? layout.afterEnd : undefined }}
      >
        <span>After ends here</span>
      </div>
      <div className="pf-compare-divider" style={{ left: pct + '%' }} />
      <span className="pf-compare-label pf-compare-label-before">Before</span>
      <span className="pf-compare-label pf-compare-label-after">After</span>
    </div>
  );
}

/* Screenshot slideshow / before-after compare dialog for portfolio cards.
   `project` is null when closed; the last project is kept for the fade-out. */
export default function PortfolioModal({ project, onClose }) {
  const [shown, setShown] = useState(project);
  const [current, setCurrent] = useState(0);
  const [pct, setPct] = useState(DEFAULT_PCT);
  const [atBottom, setAtBottom] = useState(false);
  const open = !!project;

  const slidesRef = useRef(null);
  const trackRef = useRef(null);
  const drag = useRef({ active: false, source: null, content: null });
  const touchStartX = useRef(0);

  useModalBehaviour(open, onClose);

  /* Sync the displayed project with the prop, delaying the clear so the
     overlay can finish its close transition. */
  useEffect(() => {
    if (project) {
      setShown(project);
      setCurrent(0);
      setPct(DEFAULT_PCT);
      setAtBottom(false);
      return undefined;
    }
    const id = setTimeout(() => setShown(null), 360);
    return () => clearTimeout(id);
  }, [project]);

  const slides = shown?.slides || [];
  const compareMode = slides.length > 0 && typeof slides[0] === 'object' && 'before' in slides[0];
  const single = slides.length <= 1;
  const title = shown?.title || 'Project';

  const goTo = useCallback(
    (index) => {
      if (!slides.length) return;
      const next = ((index % slides.length) + slides.length) % slides.length;
      setCurrent(next);
      setAtBottom(false);
      if (compareMode) setPct(DEFAULT_PCT);
      const el = slidesRef.current?.children[next];
      if (el) el.scrollTop = 0;
    },
    [slides.length, compareMode]
  );

  /* Keyboard navigation while open. */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, current, goTo]);

  /* Divider dragging: from the header bar or directly on the image. */
  const pctFromTrack = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    return ((clientX - r.left) / r.width) * 100;
  };
  const pctFromContent = (content, clientX) => {
    const r = content.getBoundingClientRect();
    return ((clientX - r.left) / r.width) * 100;
  };

  useEffect(() => {
    const move = (clientX) => {
      const d = drag.current;
      if (!d.active) return;
      if (d.source === 'track') setPct(clampPct(pctFromTrack(clientX)));
      else if (d.content) setPct(clampPct(pctFromContent(d.content, clientX)));
    };
    const onMouseMove = (e) => move(e.clientX);
    const onTouchMove = (e) => move(e.touches[0].clientX);
    const end = () => {
      drag.current = { active: false, source: null, content: null };
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', end);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', end);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', end);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', end);
    };
  }, []);

  const onTrackMouseDown = (e) => {
    drag.current = { active: true, source: 'track', content: null };
    setPct(clampPct(pctFromTrack(e.clientX)));
    e.preventDefault();
  };
  const onTrackTouchStart = (e) => {
    drag.current = { active: true, source: 'track', content: null };
    setPct(clampPct(pctFromTrack(e.touches[0].clientX)));
  };
  const onSlidesMouseDown = (e) => {
    if (!compareMode) return;
    const content = e.target.closest('.pf-compare-content');
    if (!content) return;
    drag.current = { active: true, source: 'image', content };
    setPct(clampPct(pctFromContent(content, e.clientX)));
    e.preventDefault();
  };
  const onSlidesTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    if (!compareMode) return;
    const content = e.target.closest('.pf-compare-content');
    if (content) drag.current = { active: true, source: 'image', content };
  };
  const onSlidesTouchEnd = (e) => {
    if (compareMode) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
  };
  const onSlideScroll = (e) => {
    const el = e.currentTarget;
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 8);
  };

  const headerTitle = compareMode ? title + ' — ' + (slides[current]?.label || 'Page ' + (current + 1)) : title;

  return (
    <div
      className={'pf-modal-overlay' + (open ? ' open' : '')}
      id="pfModalOverlay"
      role="dialog"
      aria-modal="true"
      aria-label="Project screenshots"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="pf-modal">
        <div className="pf-modal-header">
          <div className="pf-modal-header-top">
            <div className="pf-modal-info">
              <span className="pf-modal-tag" id="pfModalTag">{shown?.typeLabel || ''}</span>
              <h2 className="pf-modal-title" id="pfModalTitle">{shown ? headerTitle : ''}</h2>
            </div>
            <button className="pf-modal-close" id="pfModalClose" aria-label="Close" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
          <div className={'pf-compare-bar' + (open && compareMode ? ' active' : '')} id="pfCompareBar">
            <span className="pf-compare-bar-lbl pf-lbl-before">Before</span>
            <div className="pf-compare-track" id="pfCompareTrack" ref={trackRef} onMouseDown={onTrackMouseDown} onTouchStart={onTrackTouchStart}>
              <div className="pf-compare-fill" id="pfCompareFill" style={{ width: pct + '%' }} />
              <button className="pf-compare-thumb" id="pfCompareThumb" aria-label="Drag to compare" style={{ left: pct + '%' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
            <span className="pf-compare-bar-lbl pf-lbl-after">After</span>
          </div>
        </div>

        <div className={'pf-modal-stage' + (single ? ' pf-single' : '')}>
          <button className={'pf-modal-nav pf-modal-prev' + (single ? ' pf-hidden' : '')} id="pfModalPrev" aria-label="Previous page" onClick={() => goTo(current - 1)}>
            <ChevronLeftIcon />
          </button>
          <div
            className={'pf-modal-slides' + (atBottom ? ' pf-at-bottom' : '')}
            id="pfModalSlides"
            ref={slidesRef}
            onMouseDown={onSlidesMouseDown}
            onTouchStart={onSlidesTouchStart}
            onTouchEnd={onSlidesTouchEnd}
          >
            {slides.map((slide, i) => (
              <div key={compareMode ? slide.after + i : slide} className={'pf-modal-slide' + (i === current ? ' active' : '')} onScroll={onSlideScroll}>
                {compareMode ? (
                  <CompareSlide slide={slide} pct={i === current ? pct : DEFAULT_PCT} />
                ) : (
                  <>
                    <img src={slide} alt={title + ' — page ' + (i + 1)} loading="lazy" />
                    <div className="pf-page-end"><span>End of page</span></div>
                  </>
                )}
              </div>
            ))}
          </div>
          <button className={'pf-modal-nav pf-modal-next' + (single ? ' pf-hidden' : '')} id="pfModalNext" aria-label="Next page" onClick={() => goTo(current + 1)}>
            <ChevronRightIcon />
          </button>
        </div>

        <div className="pf-modal-footer">
          <div className="pf-modal-dots" id="pfModalDots" style={{ display: single ? 'none' : 'flex' }}>
            {slides.map((_, i) => (
              <button key={i} className={'pf-modal-dot' + (i === current ? ' active' : '')} aria-label={'Go to page ' + (i + 1)} onClick={() => goTo(i)} />
            ))}
          </div>
          <span className="pf-modal-counter" id="pfModalCounter">{slides.length > 1 ? current + 1 + ' / ' + slides.length : ''}</span>
        </div>
      </div>
    </div>
  );
}
