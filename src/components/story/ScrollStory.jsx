import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { STORY_CHAPTERS } from '../../data/story.js';
import { PORTFOLIO } from '../../data/portfolio.js';
import { PREFERS_REDUCED_MOTION } from '../../lib/site.js';

const N = STORY_CHAPTERS.length;
const LAST = N - 1;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, x) => {
  const k = clamp01((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};

/* Sheets that fan out of the folder in the last chapter (Raza in the middle). */
const FAN_ORDER = ['top-one-salon', 'raza-academy', 'change-work-therapies'];
const SCENE_CLIENTS = FAN_ORDER.map((id) => PORTFOLIO.find((p) => p.id === id))
  .filter(Boolean)
  .map((p) => ({ id: p.id, title: p.title, img: p.preview, host: new URL(p.liveUrl).hostname }));
const WORK = PORTFOLIO.filter((p) => p.liveUrl);

/* Scroll → story position. Each chapter "dwells" around its whole number so
   the copy has time to be read, and the scene moves between chapters. */
function storyPosition(section) {
  const total = section.offsetHeight - window.innerHeight;
  if (total <= 0) return 0;
  const s = clamp01(-section.getBoundingClientRect().top / total) * LAST;
  const i = Math.min(LAST - 1, Math.floor(s));
  return i + smooth(0.12, 0.88, s - i);
}

function ChapterCopy({ chapter, index, onSeeWork }) {
  const Title = index === 0 ? 'h1' : 'h2';
  return (
    <div className="story-ch-inner">
      <p className="story-eyebrow">
        {chapter.num && <span className="story-num">{chapter.num}</span>}
        {chapter.eyebrow}
      </p>
      <Title className={'story-title' + (index === 0 ? ' story-title--hero' : '')}>
        {chapter.title} <em>{chapter.accent}</em>
      </Title>
      <p className="story-body">{chapter.body}</p>
      {chapter.points && (
        <ul className="story-points">
          {chapter.points.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}
      {chapter.id === 'intro' && (
        <>
          <div className="story-actions">
            <Link to="/register" className="btn btn-primary">Get a free quote</Link>
            <button type="button" className="btn btn-outline" onClick={onSeeWork}>See our work</button>
          </div>
          <p className="story-note">Quoted per project · Most sites live in 1–2 weeks</p>
        </>
      )}
      {chapter.id === 'work' && (
        <>
          <ul className="story-work">
            {WORK.map((p) => (
              <li key={p.id}>
                <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">
                  <span className="story-work-name">{p.title}</span>
                  <span className="story-work-meta">{p.industry} · {p.status === 'live' ? 'Live' : 'Delivered'}</span>
                  <span className="story-work-arrow" aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="story-actions">
            <Link to="/portfolio" className="btn btn-primary">See the full portfolio</Link>
            <Link to="/register" className="btn btn-outline">Start your project</Link>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Home page scroll story: a sticky full-screen WebGL stage with the chapter
 * copy layered on top. The scene (three.js) is code-split and loaded on
 * mount; until it arrives, or if WebGL is unavailable, the copy still works.
 * Reduced-motion visitors get the chapters as plain stacked sections with a
 * single still render of the folder.
 */
export default function ScrollStory() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const stillRef = useRef(null);
  const chapterRefs = useRef([]);
  const railRef = useRef(null);
  const progressRef = useRef(null);
  const cueRef = useRef(null);
  const [mode, setMode] = useState(PREFERS_REDUCED_MOTION ? 'static' : 'story');
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  const scrollToChapter = useCallback(
    (i, behavior = 'smooth') => {
      const section = sectionRef.current;
      if (!section) return;
      if (mode === 'static') {
        const el = chapterRefs.current[i];
        if (el) el.scrollIntoView({ behavior: PREFERS_REDUCED_MOTION ? 'auto' : behavior, block: 'start' });
        return;
      }
      const total = section.offsetHeight - window.innerHeight;
      const top = section.getBoundingClientRect().top + window.scrollY + (i / LAST) * total;
      window.scrollTo({ top, behavior });
    },
    [mode]
  );

  const skipStory = () => {
    const next = document.getElementById('pricing');
    if (next) next.scrollIntoView({ behavior: PREFERS_REDUCED_MOTION ? 'auto' : 'smooth' });
  };

  /* Animated story: scroll drives the copy directly and the scene through setTarget. */
  useEffect(() => {
    if (mode !== 'story') return undefined;
    const section = sectionRef.current;
    const stage = stageRef.current;
    let scene = null;
    let cancelled = false;
    let raf = 0;
    let t = 0;

    const paint = () => {
      raf = 0;
      t = storyPosition(section);
      chapterRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = t - i;
        const a = i === LAST && d > 0 ? 1 : 1 - smooth(0.28, 0.5, Math.abs(d));
        el.style.opacity = a.toFixed(3);
        el.style.transform = 'translate3d(0,' + (-d * 56).toFixed(1) + 'px,0)';
        el.classList.toggle('is-active', a > 0.5);
      });
      const active = Math.round(t);
      if (railRef.current) {
        railRef.current.querySelectorAll('button').forEach((b, i) => {
          b.classList.toggle('is-active', i === active);
          if (i === active) b.setAttribute('aria-current', 'step');
          else b.removeAttribute('aria-current');
        });
      }
      if (progressRef.current) progressRef.current.style.transform = 'scaleX(' + (t / LAST).toFixed(4) + ')';
      if (cueRef.current) cueRef.current.style.opacity = (1 - smooth(0.02, 0.18, t)).toFixed(3);
      if (scene) scene.setTarget(t);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const onPointer = (e) => {
      if (scene) scene.setPointer(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
    };
    if (fine) window.addEventListener('pointermove', onPointer, { passive: true });

    /* Inactive chapters are only transparent (still readable by screen readers
       and reachable by Tab); focusing one scrolls the story to it. */
    const onFocus = (e) => {
      const ch = e.target.closest ? e.target.closest('.story-ch') : null;
      if (!ch) return;
      const i = Number(ch.dataset.i);
      if (Math.abs(t - i) > 0.3) scrollToChapter(i, 'instant');
    };
    stage.addEventListener('focusin', onFocus);

    const io = new IntersectionObserver(([entry]) => scene && scene.setVisible(entry.isIntersecting), { rootMargin: '120px 0px' });
    io.observe(section);
    const ro = new ResizeObserver(() => scene && scene.resize());
    ro.observe(stage);

    import('./storyScene.js')
      .then(({ createStoryScene }) => {
        if (cancelled) return;
        try {
          scene = createStoryScene(stage, { clients: SCENE_CLIENTS });
          scene.setTarget(t, true);
          setReady(true);
        } catch (err) {
          setFailed(true);
          setMode('static');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setMode('static');
        }
      });

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onPointer);
      stage.removeEventListener('focusin', onFocus);
      io.disconnect();
      ro.disconnect();
      if (scene) scene.dispose();
      setReady(false);
    };
  }, [mode, scrollToChapter]);

  /* Static fallback: one still render of the folder, if WebGL works. */
  useEffect(() => {
    if (mode !== 'static' || failed || !stillRef.current) return undefined;
    const el = stillRef.current;
    let scene = null;
    let cancelled = false;
    const ro = new ResizeObserver(() => scene && scene.resize());
    import('./storyScene.js')
      .then(({ createStoryScene }) => {
        if (cancelled) return;
        try {
          scene = createStoryScene(el, { clients: SCENE_CLIENTS, still: true });
          ro.observe(el);
          setReady(true);
        } catch (err) {
          setFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      ro.disconnect();
      if (scene) scene.dispose();
    };
  }, [mode, failed]);

  const cls = 'story story--' + mode + (ready ? ' is-ready' : '');

  return (
    <section ref={sectionRef} className={cls} style={{ '--story-n': N }} aria-label="How PixelFold works, from first chat to launch">
      <div className="story-stage" ref={stageRef}>
        <div className="story-bg" aria-hidden="true" />
        <div className="story-grain" aria-hidden="true" />
        <div className="story-chapters">
          {STORY_CHAPTERS.map((c, i) => (
            <Fragment key={c.id}>
              <article
                className={'story-ch story-ch--' + c.id + ' story-ch--' + c.side}
                data-i={i}
                ref={(el) => {
                  chapterRefs.current[i] = el;
                }}
              >
                <ChapterCopy chapter={c} index={i} onSeeWork={() => scrollToChapter(LAST)} />
              </article>
              {mode === 'static' && i === 0 && !failed && <div className="story-still" ref={stillRef} aria-hidden="true" />}
            </Fragment>
          ))}
        </div>

        {mode === 'story' && (
          <>
            <nav className="story-rail" ref={railRef} aria-label="Story chapters">
              {STORY_CHAPTERS.map((c, i) => (
                <button key={c.id} type="button" onClick={() => scrollToChapter(i)}>
                  <span className="story-rail-label">{c.rail}</span>
                  <span className="story-rail-dot" aria-hidden="true" />
                </button>
              ))}
            </nav>
            <div className="story-progress" aria-hidden="true"><span ref={progressRef} /></div>
            <div className="story-cue" ref={cueRef} aria-hidden="true">
              <span>Scroll to unfold</span>
              <i />
            </div>
            <button type="button" className="story-skip" onClick={skipStory}>Skip the story ↓</button>
          </>
        )}
      </div>
    </section>
  );
}
