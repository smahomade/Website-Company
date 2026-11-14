import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, Images } from 'lucide-react';
import Seo from '@/components/Seo.jsx';
import PageHeader from '@/components/site/PageHeader.jsx';
import ProjectViewer from '@/components/site/ProjectViewer.jsx';
import BrowserFrame from '@/components/home/BrowserFrame.jsx';
import TourFrame from '@/components/site/TourFrame.jsx';
import Quotes from '@/components/home/Quotes.jsx';
import { Button } from '@/components/ui/button';
import { PORTFOLIO } from '@/data/portfolio.js';
import { HERO_CARDS } from '@/data/heroCards.js';
import NotFound from './NotFound.jsx';

/* One client's project (/portfolio/<id>): what they needed, what we built, where it is now, with a
   few of its pages and the rest a click away. Content is the `caseStudy` in portfolio.js. */
export default function CaseStudy() {
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const p = PORTFOLIO.find((x) => x.id === id && x.caseStudy);
  if (!p) return <NotFound />;
  const cs = p.caseStudy;
  const studies = PORTFOLIO.filter((x) => x.caseStudy);
  const next = studies[(studies.indexOf(p) + 1) % studies.length];
  /* the first three pages: their small cropped copies (cs.shots) when there are some, else the
     full-length screenshots */
  const shots = (p.slides || []).slice(0, 3).map((s, i) => {
    const full = typeof s === 'string' ? s : s.after;
    const label = typeof s === 'string' ? null : s.label;
    if (!cs.shots) return { key: full, src: full, label };
    const at = (w) => `${cs.shots}-${i + 1}-${w}.webp`;
    return { key: full, src: at(1000), srcSet: `${at(600)} 600w, ${at(1000)} 1000w`, label };
  });
  const card = HERO_CARDS.find((c) => c.name === p.title);
  const pages = card ? shots.slice(1) : shots; /* the home page is in the header already */
  const host = p.liveUrl ? p.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : null;
  const h2 = 'font-display text-2xl font-bold tracking-[-0.02em] text-ink';

  return (
    <div className="leading-normal">
      <Seo title={p.title + ' case study — PixelFold'} description={cs.summary} path={'/portfolio/' + p.id} />
      <PageHeader
        title={cs.title}
        accent={cs.accent}
        sub={cs.summary}
        chips={[p.industry, cs.pages, p.typeLabel.replace(' Build', ' build')]}
        aside={card && <TourFrame name={p.title} url={card.url} still={card.tourPoster || card.img} tour={card.tour} eager />}
      >
        {p.liveUrl && (
          <Button asChild size="lg">
            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">
              Visit {host} <ArrowUpRight />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </Button>
        )}
        {p.slides && (
          <Button size="lg" variant="outline" onClick={() => setOpen(true)} aria-haspopup="dialog">
            <Images /> See every page
          </Button>
        )}
      </PageHeader>

      <section className="bg-background pb-24 md:pb-32">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="space-y-10 lg:sticky lg:top-28 lg:self-start">
            <div>
              <h2 className={h2}>What they needed</h2>
              <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{cs.need}</p>
            </div>
            <div>
              <h2 className={h2}>What we built</h2>
              <ul className="mt-4 space-y-3">
                {cs.built.map((b) => (
                  <li key={b} className="flex items-start gap-3 leading-relaxed text-ink">
                    <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-ink">
                      <Check aria-hidden="true" className="size-3" strokeWidth={3} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className={h2}>The result</h2>
              <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{cs.result}</p>
            </div>
          </div>

          <div className="space-y-6">
            {pages.map((s, i) => (
              <figure key={s.key}>
                <BrowserFrame url={host}>
                  <img
                    src={s.src}
                    srcSet={s.srcSet}
                    sizes={s.srcSet ? '(min-width: 1024px) 600px, 100vw' : undefined}
                    width="1000"
                    height="625"
                    alt={p.title + (s.label ? ', ' + s.label + ' page' : ', page ' + (i + 1))}
                    loading={i || card ? 'lazy' : 'eager'}
                    className="block aspect-[16/10] w-full object-cover object-top"
                  />
                </BrowserFrame>
                {s.label && <figcaption className="mt-2 text-sm font-semibold text-muted-foreground">{s.label}</figcaption>}
              </figure>
            ))}
            {p.slides && p.slides.length > 3 && (
              <Button variant="outline" onClick={() => setOpen(true)} aria-haspopup="dialog">
                <Images /> See all {p.slides.length} pages
              </Button>
            )}
          </div>
        </div>
      </section>

      <Quotes only={p.id} title={'What ' + p.title} accent="say." />

      <section className="bg-espresso py-20 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 md:px-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.06] tracking-[-0.03em] text-cream">Want something like this?</h2>
            <p className="mt-4 text-lg leading-relaxed text-cream/70">Tell us about your project and we’ll come back within 24 hours with a clear scope, timeline and quote.</p>
            <Button asChild size="lg" className="mt-8">
              <Link to="/quote">
                Book a free consultation <ArrowRight />
              </Link>
            </Button>
          </div>
          {next && next !== p && (
            <Link
              to={'/portfolio/' + next.id}
              className="group block rounded-[24px] border border-cream/10 bg-[#24211d] p-7 outline-none transition-colors hover:border-cream/30 focus-visible:ring-[3px] focus-visible:ring-ring/45"
            >
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-cream/55">Next case study</p>
              <p className="mt-2 flex items-center gap-2 font-display text-2xl font-bold text-cream">
                {next.title}
                <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
              </p>
              <p className="mt-2 leading-relaxed text-cream/70">{next.caseStudy.summary}</p>
            </Link>
          )}
        </div>
      </section>

      <ProjectViewer project={open ? p : null} onClose={() => setOpen(false)} />
    </div>
  );
}
