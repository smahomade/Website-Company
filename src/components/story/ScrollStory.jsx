import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { STORY_CHAPTERS } from '../../data/story.js';
import { PORTFOLIO } from '../../data/portfolio.js';
import { HERO_CARDS } from '../../data/heroCards.js';
import { PREFERS_REDUCED_MOTION } from '../../lib/site.js';
import ReelPopup from '../ReelPopup.jsx';
import { introFolder, storyLayout, POSTERS } from './storyLayout.js';

const N = STORY_CHAPTERS.length;
const LAST = N - 1;
const BUILD = STORY_CHAPTERS.findIndex((c) => c.id === 'build');

/* Animated or still: the visitor's own choice (the Reduce motion / Play the
   animated story buttons) when they have made one, otherwise their system's
   reduced-motion setting. */
const MOTION_KEY = 'pf-story-motion';
let chosenMotion = null; /* this visit's choice, for when storage is blocked */
const storedMotion = () => {
  if (chosenMotion) return chosenMotion;
  try {
    return window.localStorage.getItem(MOTION_KEY);
  } catch (err) {
    return null;
  }
};
const wantsStill = () => {
  const choice = typeof window === 'undefined' ? null : storedMotion();
  return choice === 'off' || (choice !== 'on' && PREFERS_REDUCED_MOTION);
};
const HOLD = 0.5; /* viewport heights the finished Work chapter stays pinned */
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, x) => {
  const k = clamp01((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};

/* Sheets that fan out of the folder in the last chapter (Raza in the middle). */
const FAN_ORDER = ['top-one-salon', 'raza-academy', 'change-work-therapies'];
const hostOf = (u) => {
  try {
    return new URL(u).hostname;
  } catch (err) {
    return '';
  }
};
/* Their screenshots are copies in public/images/story (shot-<id>.webp): WebGL
   can't read the portfolio images straight from the R2 bucket, which sends no
   CORS headers. A sheet with no copy keeps its drawn stand-in. */
const SCENE_CLIENTS = FAN_ORDER.map((id) => PORTFOLIO.find((p) => p.id === id))
  .filter((p) => p && p.liveUrl)
  .map((p) => ({ id: p.id, title: p.title, img: '/images/story/shot-' + p.id + '.webp', host: hostOf(p.liveUrl) }));
/* Clicking a sheet opens its project preview (the cards the old hero reel used). */
const PREVIEW_OF = Object.fromEntries(
  SCENE_CLIENTS.map((c) => [c.id, HERO_CARDS.find((h) => h.name === c.title)]).filter(([, card]) => card)
);
const PREVIEW_CARDS = Object.values(PREVIEW_OF);

/* the loading picture (POSTERS) for a stage this size; it fades out as the scene fades in */
const posterFor = (w, h) => (storyLayout(w, h).portrait ? POSTERS.tall : POSTERS.wide);
/* From here on in the story the popup's clips are fetched, so one plays the
   moment a site is clicked (not for visitors who asked their browser to save data). */
const CLIPS_FROM = 3.2;
const SAVE_DATA = typeof navigator !== 'undefined' && !!(navigator.connection && navigator.connection.saveData);
const WORK = PORTFOLIO.filter((p) => p.liveUrl);

/* On the home page, start fetching the 3D chunk (and the canvas-only font) while
   the app boots, instead of after React's first commit. */
const EARLY = typeof window !== 'undefined' && window.location.pathname === '/' && !wantsStill();
let scenePromise = EARLY ? import('./storyScene.js') : null;
if (EARLY && document.fonts) document.fonts.load('700 36px Caveat').catch(() => {});
const loadScene = () => {
  if (!scenePromise) scenePromise = import('./storyScene.js');
  return scenePromise;
};

/* Scroll distance over which the story plays. Measured against the stage
   (100svh) rather than innerHeight, so a mobile toolbar showing or hiding
   can't move the story; the last HOLD of it keeps the finale pinned. */
const storyDistance = (section, stage) => section.offsetHeight - stage.offsetHeight * (1 + HOLD);
function storyProgress(section, stage) {
  const total = storyDistance(section, stage);
  return total > 0 ? clamp01(-section.getBoundingClientRect().top / total) : 0;
}
/* Progress → story position. Each chapter "dwells" around its whole number so
   the copy has time to be read, and the scene moves between chapters. */
function storyPosition(progress) {
  const s = progress * LAST;
  const i = Math.min(LAST - 1, Math.floor(s));
  return i + smooth(0.12, 0.88, s - i);
}

/* Copy opacity for chapter i at story position t. */
const copyAlpha = (t, i) => {
  const d = t - i;
  return i === LAST && d > 0 ? 1 : 1 - smooth(0.28, 0.5, Math.abs(d));
};

function ChapterCopy({ chapter, index, onSeeWork, onPlay }) {
  const Title = index === 0 ? 'h1' : 'h2';
  return (
    <div className="story-ch-inner">
      <p className="story-eyebrow">
        {chapter.num && <span className="story-num">{chapter.num}</span>}
        {chapter.eyebrow}
      </p>
      <Title className={'story-title' + (index === 0 ? ' story-title--hero' : '')} tabIndex={chapter.id === 'work' ? -1 : undefined}>
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
          {onPlay && (
            <button type="button" className="story-motion story-motion--play" onClick={onPlay}>
              Play the animated story
            </button>
          )}
        </>
      )}
      {chapter.id === 'work' && (
        <>
          <ul className="story-work">
            {WORK.map((p) => (
              <li key={p.id}>
                <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">
                  <span className="story-work-name">{p.title}</span>
                  <span className="story-work-meta">
                    {p.industry} · {p.status === 'live' ? 'Live' : 'Delivered'}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </span>
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
 * Once the scene runs, the copy follows the scene's eased position so the
 * two never drift apart. Reduced-motion visitors get the chapters as plain
 * stacked sections with a pre-rendered still of the folder.
 */
export default function ScrollStory() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const chapterRefs = useRef([]);
  const railRef = useRef(null);
  const progressRef = useRef(null);
  const cueRef = useRef(null);
  const skipRef = useRef(null);
  const sceneRef = useRef(null);
  const lastTRef = useRef(null); /* story position at the previous paint */
  const cutTimer = useRef(0);
  const posterRef = useRef(null);
  /* The page's prebuilt HTML is the animated story, so it starts as that (and matches); a visitor
     who wants the still version is switched over before the first paint (below). */
  const [mode, setMode] = useState('story');
  const [canAnimate, setCanAnimate] = useState(true); /* false once WebGL has failed */
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState(null); /* project card shown in the popup */
  const [warm, setWarm] = useState(null); /* the site last hovered: its popup clip loads early */
  const [clipsOn, setClipsOn] = useState(false); /* the story has got near the client sites: keep their clips loaded */
  const previewRef = useRef(false);
  previewRef.current = !!preview;
  const closePreview = useCallback(() => setPreview(null), []);

  /* Hard cut of the 3D to a chapter (no fast-forward through the others). */
  const cutScene = useCallback((t, startT = t, fade = true) => {
    lastTRef.current = t;
    const scene = sceneRef.current;
    if (!scene) return;
    scene.setTarget(startT, true);
    scene.setTarget(t);
    const cv = fade && stageRef.current && stageRef.current.querySelector('.story-canvas');
    if (cv && cv.animate) cv.animate({ opacity: [0, 1] }, { duration: 260, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
  }, []);

  const scrollToChapter = useCallback(
    (i, behavior = 'smooth', { focusTitle = false } = {}) => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;
      const focusTarget = () => {
        const h = focusTitle && chapterRefs.current[i] && chapterRefs.current[i].querySelector('.story-title');
        if (h) h.focus({ preventScroll: true });
      };
      if (mode === 'static') {
        const el = chapterRefs.current[i];
        if (el) el.scrollIntoView({ behavior: PREFERS_REDUCED_MOTION ? 'instant' : behavior, block: 'start' });
        focusTarget();
        return;
      }
      const top = section.getBoundingClientRect().top + window.scrollY + (i / LAST) * storyDistance(section, stage);
      const from = storyPosition(storyProgress(section, stage));
      /* More than a chapter away: dip to charcoal and cut, instead of a long
         scroll that flashes every chapter on the way. */
      if (behavior === 'smooth' && Math.abs(i - from) > 1.2) {
        if (stage.classList.contains('is-cut')) return;
        stage.classList.add('is-cut');
        clearTimeout(cutTimer.current);
        cutTimer.current = setTimeout(() => {
          if (!sectionRef.current) return;
          window.scrollTo({ top, behavior: 'instant' });
          /* the finale starts just before the fan so the sheets rise as the veil lifts */
          cutScene(i, i === LAST ? 4.6 : i, false);
          focusTarget();
          requestAnimationFrame(() => stage.classList.remove('is-cut'));
        }, 180);
        return;
      }
      window.scrollTo({ top, behavior });
    },
    [mode, cutScene]
  );

  const skipStory = () => {
    const next = document.getElementById('pricing');
    if (next) next.scrollIntoView({ behavior: PREFERS_REDUCED_MOTION ? 'instant' : 'smooth' });
  };

  /* Switch between the animated story and the still version, and remember it. */
  const setMotion = (on) => {
    chosenMotion = on ? 'on' : 'off';
    try {
      window.localStorage.setItem(MOTION_KEY, on ? 'on' : 'off');
    } catch (err) {
      /* private mode: the choice just lasts for this visit */
    }
    setMode(on ? 'story' : 'static');
    const section = sectionRef.current;
    if (section) window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
  };

  useLayoutEffect(() => {
    if (wantsStill()) setMode('static');
  }, []);

  /* The loading picture: on the scene's folder, at whatever size the stage is. Only from the top
     of the page (further down the story isn't at its opening frame). */
  useLayoutEffect(() => {
    const img = posterRef.current;
    const stage = stageRef.current;
    const section = sectionRef.current;
    if (mode !== 'story' || !img || !stage || !section) return undefined;
    if (section.getBoundingClientRect().top < -20) {
      img.style.display = 'none';
      return undefined;
    }
    const place = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const P = posterFor(w, h);
      const f = introFolder(w, h);
      const k = f.h / P.fh;
      if (img.getAttribute('src') !== P.src) img.setAttribute('src', P.src);
      Object.assign(img.style, { width: P.w * k + 'px', height: P.h * k + 'px', left: f.x - P.x * k + 'px', top: f.y - P.y * k + 'px', visibility: 'visible' });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [mode]);

  /* Animated story. */
  useEffect(() => {
    if (mode !== 'story' || wantsStill()) return undefined; /* (a still-preferring visitor's first render: about to switch) */
    const section = sectionRef.current;
    const stage = stageRef.current;
    const portraitMq = window.matchMedia('(max-aspect-ratio: 19/20)');
    let scene = null;
    let cancelled = false;
    let raf = 0;
    let t = 0;
    let progress = 0;
    let lastTotal = storyDistance(section, stage);
    let painted = NaN;

    /* The build chapter's points tick off as the site assembles in the scene. */
    const chips = chapterRefs.current[BUILD] ? [...chapterRefs.current[BUILD].querySelectorAll('.story-points li')] : [];
    let ticked = -1;
    const paintChips = (build) => {
      const n = build >= 1 ? 3 : build >= 0.75 ? 2 : build >= 0.5 ? 1 : 0;
      if (n === ticked) return;
      ticked = n;
      chips.forEach((li, i) => li.classList.toggle('is-pending', i >= n));
    };

    /* Copy + rail, from the eased position once the scene runs. */
    let clips = false;
    const paintCopy = (tc) => {
      if (!clips && tc > CLIPS_FROM && !SAVE_DATA) {
        clips = true;
        setClipsOn(true);
      }
      if (tc === painted) return; /* at rest tCur is constant: no style writes */
      painted = tc;
      chapterRefs.current.forEach((el, i) => {
        if (!el) return;
        const a = copyAlpha(tc, i);
        el.style.opacity = a.toFixed(3);
        el.style.transform = 'translate3d(0,' + (-(tc - i) * 56).toFixed(1) + 'px,0)';
        el.classList.toggle('is-active', a > 0.5);
      });
      const active = Math.round(tc);
      if (railRef.current) {
        railRef.current.querySelectorAll('button').forEach((b, i) => {
          b.classList.toggle('is-active', i === active);
          if (i === active) b.setAttribute('aria-current', 'step');
          else b.removeAttribute('aria-current');
        });
      }
    };

    /* Scroll-driven bits: scene target, progress, cue, skip. */
    const paint = () => {
      raf = 0;
      progress = storyProgress(section, stage);
      t = storyPosition(progress);
      if (scene) {
        /* instant jumps (Tab between intro and Work, find-in-page) cut the scene
           instead of replaying every chapter behind the copy */
        const jump = lastTRef.current !== null && Math.abs(t - lastTRef.current) > 2;
        if (jump) cutScene(t);
        else scene.setTarget(t);
      } else {
        paintCopy(t);
      }
      lastTRef.current = t;
      const total = storyDistance(section, stage);
      const past = clamp01((-section.getBoundingClientRect().top - total - stage.offsetHeight * HOLD) / (stage.offsetHeight * 0.15));
      if (progressRef.current) {
        progressRef.current.style.transform = 'scaleX(' + (t / LAST).toFixed(4) + ')';
        progressRef.current.parentNode.style.opacity = (1 - past).toFixed(3);
      }
      if (cueRef.current) cueRef.current.style.opacity = (1 - smooth(0.02, 0.18, t)).toFixed(3);
      /* phones show Skip on the intro only; wide screens drop it once Work repeats its job */
      if (skipRef.current) skipRef.current.classList.toggle('is-done', portraitMq.matches ? t > 0.3 : t > LAST - 0.4);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };

    /* Measure the copy columns and the rail for the scene (cube clearing, finale
       fit, where the cat can stand on upright screens, and its path past the copy). */
    const measure = () => {
      if (!scene) return;
      const sr = stage.getBoundingClientRect();
      const boxes = chapterRefs.current.map((el) => {
        const inner = el && el.querySelector('.story-ch-inner');
        if (!inner) return null;
        const r = inner.getBoundingClientRect();
        /* `top` and `bottom` without the slide paintCopy puts on chapters that aren't current */
        const slid = /translate3d\(0(?:px)?,\s*(-?[\d.]+)px/.exec(el.style.transform);
        const dy = slid ? parseFloat(slid[1]) : 0;
        return { left: r.left - sr.left, right: r.right - sr.left, top: r.top - sr.top - dy, bottom: r.bottom - sr.top - dy };
      });
      const rail = railRef.current && railRef.current.offsetParent ? railRef.current.getBoundingClientRect().left - sr.left : 0;
      scene.setCopy(boxes, rail);
    };

    /* Keep the same chapter when the viewport resizes or the phone rotates.
       `progress` still holds the pre-resize value here. */
    const onResize = () => {
      const total = storyDistance(section, stage);
      if (Math.abs(total - lastTotal) > 1 && progress > 0 && progress < 1) {
        const top = section.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + progress * total, behavior: 'instant' });
      }
      lastTotal = total;
      onScroll();
    };

    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    /* pointer position on the stage in normalised device coords */
    const toNdc = (e) => {
      const r = stage.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)];
    };
    const overControl = (e) => e.target.closest && e.target.closest('a, button, input, select, textarea');
    /* start loading a site's popup clip once the visitor shows interest in it */
    let warmed = null;
    const warmUp = (site) => {
      if (!site || site === warmed || !PREVIEW_OF[site]) return;
      warmed = site;
      setWarm(PREVIEW_OF[site]);
    };
    const onPointer = (e) => {
      if (!scene) return;
      scene.setPointer(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
      /* the cat and the fanned client sites are clickable: show it, and lift the site */
      const hit = previewRef.current || overControl(e) ? null : scene.pick(...toNdc(e));
      stage.classList.toggle('is-over-hit', !!hit);
      const site = hit && hit !== 'cat' ? hit : null;
      scene.setHover(site);
      warmUp(site);
    };
    /* poke the cat (decorative: it hops and blinks); a press on a site is about to open it */
    const onPoke = (e) => {
      if (!scene || overControl(e)) return;
      scene.pokeCat(...toNdc(e));
      warmUp(scene.pick(...toNdc(e)));
    };
    stage.addEventListener('pointerdown', onPoke);
    /* click a client site: open its preview */
    const onPick = (e) => {
      if (!scene || overControl(e)) return;
      const card = PREVIEW_OF[scene.pick(...toNdc(e))];
      if (!card) return;
      scene.setHover(null);
      stage.classList.remove('is-over-hit');
      setPreview(card);
    };
    stage.addEventListener('click', onPick);
    const onLeave = () => {
      if (!scene) return;
      scene.setPointer(0, 0);
      scene.setHover(null);
      stage.classList.remove('is-over-hit');
    };
    if (fine) {
      window.addEventListener('pointermove', onPointer, { passive: true });
      document.documentElement.addEventListener('mouseleave', onLeave);
      window.addEventListener('blur', onLeave);
    }

    /* Inactive chapters are only transparent (still readable by screen readers
       and reachable by Tab); focusing one jumps the story to it. */
    const onFocus = (e) => {
      const ch = e.target.closest ? e.target.closest('.story-ch') : null;
      if (!ch) return;
      const i = Number(ch.dataset.i);
      if (Math.abs(storyPosition(storyProgress(section, stage)) - i) > 0.3) {
        scrollToChapter(i, 'instant');
        cutScene(i);
      }
    };
    stage.addEventListener('focusin', onFocus);

    /* Space / PageUp / PageDown step whole chapters while the story is on screen,
       so a keyboard visitor never comes to rest mid-crossfade. Outside the story
       (or past its first/last chapter) the browser pages as normal. */
    let keyGoal = -1;
    let keyGoalAt = 0;
    const onKey = (e) => {
      if (previewRef.current || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const down = e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey);
      const up = e.key === 'PageUp' || (e.key === ' ' && e.shiftKey);
      if (!down && !up) return;
      const a = document.activeElement;
      if (a && a.closest && a.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === ' ' && a && a.closest && a.closest('a, button, summary, [role="button"]')) return;
      const r = section.getBoundingClientRect();
      if (r.top > 1 || r.bottom < window.innerHeight / 2) return;
      const pos = storyPosition(storyProgress(section, stage));
      const now = performance.now();
      const busy = keyGoal >= 0 && now - keyGoalAt < 700 && Math.abs(pos - keyGoal) > 0.02;
      if (busy && e.repeat) {
        e.preventDefault();
        return;
      }
      const next = busy ? keyGoal + (down ? 1 : -1) : down ? Math.floor(pos + 0.05) + 1 : Math.ceil(pos - 0.05) - 1;
      if (next < 0 || next > LAST) return;
      e.preventDefault();
      keyGoal = next;
      keyGoalAt = now;
      scrollToChapter(next);
    };
    window.addEventListener('keydown', onKey);

    const io = new IntersectionObserver(([entry]) => scene && scene.setVisible(entry.isIntersecting), { rootMargin: '120px 0px' });
    io.observe(section);
    const ro = new ResizeObserver(() => {
      if (scene) {
        scene.resize();
        measure();
      }
    });
    ro.observe(stage);

    loadScene()
      .then(({ createStoryScene }) => (cancelled ? null : createStoryScene(stage, { clients: SCENE_CLIENTS })))
      .then((created) => {
        if (!created) return;
        if (cancelled) {
          created.dispose();
          return;
        }
        scene = created;
        sceneRef.current = scene;
        if (import.meta.env.DEV) window.__pfStory = scene;
        scene.setOnFrame((tc, progress) => {
          paintCopy(tc);
          paintChips(progress.build);
        });
        /* have each site's opening frame ready, so its popup never opens on a blank */
        Object.values(PREVIEW_OF).forEach((card) => {
          if (card.tourPoster) new Image().src = card.tourPoster;
        });
        scene.setTarget(t, true);
        measure();
        document.fonts.ready.then(() => {
          if (!cancelled) measure();
        });
        setReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        if (import.meta.env.DEV) console.error('[story]', err);
        setCanAnimate(false);
        setMode('static');
      });

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(cutTimer.current);
      stage.classList.remove('is-cut');
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
      window.removeEventListener('keydown', onKey);
      stage.removeEventListener('focusin', onFocus);
      stage.removeEventListener('pointerdown', onPoke);
      stage.removeEventListener('click', onPick);
      stage.classList.remove('is-over-hit');
      chips.forEach((li) => li.classList.remove('is-pending'));
      io.disconnect();
      ro.disconnect();
      if (scene) scene.dispose();
      if (import.meta.env.DEV && window.__pfStory === scene) delete window.__pfStory;
      sceneRef.current = null;
      lastTRef.current = null;
      setReady(false);
    };
  }, [mode, scrollToChapter, cutScene]);

  const cls = 'story story--' + mode + (ready ? ' is-ready' : '');

  return (
    <section ref={sectionRef} className={cls} style={{ '--story-n': N, '--story-hold': HOLD }} aria-label="How PixelFold works, from first chat to launch">
      <div className="story-stage" ref={stageRef}>
        {mode === 'story' && (
          <>
            <button ref={skipRef} type="button" className="story-skip" onClick={skipStory}>
              Skip the story <span aria-hidden="true">↓</span>
            </button>
            <button type="button" className="story-motion" onClick={() => setMotion(false)}>
              Reduce motion
            </button>
          </>
        )}
        <div className="story-bg" aria-hidden="true" />
        {mode === 'story' && (
          <img
            ref={posterRef}
            className="story-poster"
            src={typeof window !== 'undefined' ? posterFor(window.innerWidth, window.innerHeight).src : undefined /* (the built page's script picks it) */}
            alt=""
            aria-hidden="true"
            decoding="async"
          />
        )}
        <div className="story-chapters">
          {STORY_CHAPTERS.map((c, i) => (
            <Fragment key={c.id}>
              <div
                className={'story-ch story-ch--' + c.id + ' story-ch--' + c.side}
                data-i={i}
                ref={(el) => {
                  chapterRefs.current[i] = el;
                }}
              >
                <ChapterCopy
                  chapter={c}
                  index={i}
                  onSeeWork={() => scrollToChapter(LAST, 'smooth', { focusTitle: true })}
                  onPlay={mode === 'static' && canAnimate ? () => setMotion(true) : undefined}
                />
              </div>
              {i === 0 && mode === 'story' && (
                <nav className="story-rail" ref={railRef} aria-label="Story chapters">
                  {STORY_CHAPTERS.map((ch, j) => (
                    <button key={ch.id} type="button" onClick={() => scrollToChapter(j)}>
                      <span className="story-rail-label">{ch.rail}</span>
                      <span className="story-rail-dot" aria-hidden="true" />
                    </button>
                  ))}
                </nav>
              )}
              {i === 0 && mode === 'static' && (
                <div className="story-still" aria-hidden="true">
                  <img
                    src="/images/story/story-still.webp"
                    srcSet="/images/story/story-still-1100.webp 1100w, /images/story/story-still.webp 2200w"
                    sizes="(max-width: 1100px) 100vw, 1100px"
                    width="1100"
                    height="559"
                    alt=""
                    decoding="async"
                  />
                </div>
              )}
            </Fragment>
          ))}
        </div>

        {mode === 'story' && (
          <>
            <div className="story-progress" aria-hidden="true"><span ref={progressRef} /></div>
            <div className="story-cue" ref={cueRef} aria-hidden="true">
              <span>Scroll to unfold</span>
              <i />
            </div>
            <div className="story-veil" aria-hidden="true" />
          </>
        )}
      </div>
      {mode === 'story' && <ReelPopup card={preview} warm={warm} keep={clipsOn ? PREVIEW_CARDS : null} onClose={closePreview} />}
    </section>
  );
}
