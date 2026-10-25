import { useEffect, useRef } from 'react';
import { CheckIcon } from './Icons.jsx';
import { PREFERS_REDUCED_MOTION } from '../lib/site.js';

/* The visitor's own Reduce motion choice from the home story (ScrollStory)
   counts here too: banners hold still for them. */
const wantsStill = () => {
  try {
    const choice = window.localStorage.getItem('pf-story-motion');
    return choice === 'off' || (choice !== 'on' && PREFERS_REDUCED_MOTION);
  } catch (err) {
    return PREFERS_REDUCED_MOTION;
  }
};

/* The banner on the inner pages, in the home page's style: a short charcoal
   band with the heading on the left and the page's own small 3D object on
   the right (`art`: steps, folders, sites, plane or brief). The page's
   content rises into it as a cream sheet with a folder tab carrying `tab`;
   `sheet` is that colour, to match the section below. */
export default function PageHero({ label, title, accent, sub, badges = [], art = null, artLabels, tab, sheet, children }) {
  const artRef = useRef(null);
  const labelsKey = (artLabels || []).join('|');

  useEffect(() => {
    const host = artRef.current;
    if (!art || !host) return undefined;
    let scene = null;
    let cancelled = false;
    import('./pagehero/pageHeroScene.js') /* no "banner" in the name: ad blockers refuse such addresses */
      .then(({ createBannerScene }) => {
        if (cancelled) return;
        scene = createBannerScene(host, { kind: art, labels: labelsKey ? labelsKey.split('|') : [], still: wantsStill() });
      })
      .catch((err) => {
        if (import.meta.env.DEV) console.error('[banner]', err); /* no WebGL: the banner goes without its object */
      });
    return () => {
      cancelled = true;
      if (scene) scene.dispose();
    };
  }, [art, labelsKey]);

  return (
    <section className={'pb' + (art ? ' pb--art' : '')} style={sheet ? { '--pb-sheet': sheet } : undefined}>
      {art && <div className="pb-art" ref={artRef} />}
      <div className="container pb-inner">
        <div className="pb-copy">
          <p className="pb-label">{label}</p>
          <h1 className="pb-title">
            {title} <em>{accent}</em>
          </h1>
          {sub && <p className="pb-sub">{sub}</p>}
          {badges.length > 0 && (
            <ul className="pb-badges">
              {badges.map((b) => (
                <li key={b}>
                  <CheckIcon /> {b}
                </li>
              ))}
            </ul>
          )}
          {children}
        </div>
      </div>
      <div className="pb-sheet" aria-hidden="true">
        <div className="container">
          <span className="pb-tab">{tab || label}</span>
        </div>
      </div>
    </section>
  );
}
