import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StaticDeck } from '@/components/ui/deck-card.jsx';
import { PORTFOLIO } from '@/data/portfolio.js';
import SectionHeading from './SectionHeading.jsx';

/* The deck and its animation library load as their own chunk, so they don't hold up the top of
   the page; the prebuilt HTML already has the cards in place. */
const ProjectDeck = lazy(() => import('@/components/ui/scroll-stacking-cards.jsx'));

const ORDER = ['top-one-salon', 'raza-academy', 'change-work-therapies'];
const GROUND = '#1c1a17'; /* bg-espresso: fills the corner cut out of each card */

/* Each site's front page: the first frame of its tour video (public/videos), plus smaller copies
   in public/images/home for phones */
const PROJECTS = ORDER.map((id) => PORTFOLIO.find((p) => p.id === id))
  .filter((p) => p && p.status === 'live' && p.caseStudy)
  .map((p) => {
    const small = '/images/home/site-' + p.id;
    const image = '/videos/' + p.id + '-tour.webp';
    return {
      id: p.id,
      name: p.title,
      summary: p.caseStudy.summary,
      url: p.liveUrl,
      image,
      srcSet: small + '-480.webp 480w, ' + small + '-800.webp 800w, ' + image + ' 1280w',
    };
  });

export default function Work() {
  return (
    <section id="work" className="relative bg-espresso text-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 pt-16 md:flex-row md:items-end md:justify-between md:px-8 md:pt-32">
        <SectionHeading
          tone="dark"
          title="Websites already working"
          accent="for real businesses."
          sub="Every one is live today. Scroll through them, then open any of them to read the case study."
        />
        <Button asChild variant="outline-light" className="self-start md:self-auto">
          <Link to="/portfolio">
            See the full portfolio <ArrowRight />
          </Link>
        </Button>
      </div>

      <Suspense fallback={<StaticDeck projects={PROJECTS} ground={GROUND} />}>
        <ProjectDeck projects={PROJECTS} ground={GROUND} />
      </Suspense>

      <div className="mx-auto max-w-6xl px-5 pb-16 md:px-8 md:pb-32">
        <p className="font-display text-[clamp(2.6rem,7vw,6.5rem)] font-bold leading-[0.95] tracking-[-0.045em] text-cream">
          Yours could be next.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/quote">
            Start your project <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}
