/**
 * Project deck: 21st.dev "Scroll Stacking Cards" by Aakash Mehra
 * (https://21st.dev/@aakashmehra/components/scroll-stacking-cards). Adapted for PixelFold: plain
 * JS, no sample sites bundled in, the corner button opens our case study, and visitors who prefer
 * reduced motion get the cards as a still column instead of the pinned deck.
 *
 * As you scroll, the next card rises from below leaning toward you and out of focus, and flattens
 * and sharpens as it lands in the middle of the window; the cards beneath lean back, sink and dim.
 * One scroll-linked, spring-smoothed value drives every card, so it follows the wheel and never
 * overshoots.
 */
import { useEffect, useRef, useState } from 'react';
/* m + LazyMotion(domMin): the slim motion component and the smallest feature set that keeps its
   styles following motion values; the full motion component bundles three times the code */
import { domMin, LazyMotion, m, useScroll, useSpring, useTransform } from 'motion/react';
import { DeckFace, StaticDeck } from './deck-card.jsx';

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (t) => 1 - (1 - t) ** 3;
const ENTER = 0.72; // share of each card's screen spent arriving; the rest it rests in place

/* How far card j has arrived (0 below the window, 1 landed) at deck progress v */
function arrived(j, v, count) {
  if (j <= 0) return 1;
  const span = Math.max(1, count - 1);
  return easeOut(clamp01((v * span - (j - 1)) / ENTER));
}

function Card({ p, i, count, progress, ground }) {
  /* cards now lying on top of this one, counted smoothly */
  const above = (v) => {
    let n = 0;
    for (let j = i + 1; j < count; j++) n += arrived(j, v, count);
    return Math.min(3, n);
  };
  const y = useTransform(progress, (v) => `${(1 - arrived(i, v, count)) * 108 - above(v) * 5}svh`); // covered cards lift so their edges show
  const rotateX = useTransform(progress, (v) => -(1 - arrived(i, v, count)) * 30 + above(v) * 5);
  const scale = useTransform(progress, (v) => 0.9 + 0.1 * arrived(i, v, count) - above(v) * 0.05);
  const filter = useTransform(progress, (v) => `blur(${((1 - arrived(i, v, count)) ** 2 * 12 + above(v) * 1.1).toFixed(2)}px)`);
  const dim = useTransform(progress, (v) => above(v) * 0.15);

  return (
    <m.article
      aria-label={p.name + ': ' + p.summary}
      className="col-start-1 row-start-1 mt-[4svh] w-[min(100%,calc(70svh*16/9),1180px)] origin-[50%_25%] will-change-[transform,filter] max-sm:w-full"
      style={{ zIndex: i + 1, y, rotateX, scale, filter }}
    >
      <DeckFace p={p} ground={ground}>
        <m.div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#0A0C14]" style={{ opacity: dim }} />
      </DeckFace>
    </m.article>
  );
}

function Deck({ projects, ground }) {
  const deck = useRef(null);
  const count = projects.length;
  const { scrollYProgress } = useScroll({ target: deck, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 380, damping: 48, mass: 0.35 });
  return (
    /* one screen of scroll per card; the stage stays pinned while they are dealt onto it */
    <LazyMotion features={domMin}>
    <div ref={deck} className="relative w-full" style={{ height: Math.max(1, count) * 100 + 'svh' }} role="region" aria-label="Projects">
      <div className="sticky top-0 grid h-[100svh] place-items-center overflow-hidden px-5 pt-16 [perspective:1800px] sm:px-10 md:pt-20 lg:px-14">
        {projects.map((p, i) => (
          <Card key={p.id} p={p} i={i} count={count} progress={progress} ground={ground} />
        ))}
      </div>
    </div>
    </LazyMotion>
  );
}

/* projects: [{ id, name, summary, url, image }]; ground: the section's colour, which fills the cut
   corner. The prebuilt page always has the deck; the still column takes over after loading for
   visitors who prefer reduced motion (reading that during the first render would not match the
   prebuilt HTML). */
export default function ProjectDeck({ projects, ground }) {
  const [still, setStill] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setStill(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return still ? <StaticDeck projects={projects} ground={ground} /> : <Deck projects={projects} ground={ground} />;
}
