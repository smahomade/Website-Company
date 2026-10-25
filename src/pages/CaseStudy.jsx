import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import PortfolioModal from '../components/PortfolioModal.jsx';
import Testimonials from '../components/Testimonials.jsx';
import { ArrowRightIcon, ExternalLinkIcon, PagesIcon } from '../components/Icons.jsx';
import { PORTFOLIO } from '../data/portfolio.js';
import NotFound from './NotFound.jsx';

/* One client's project (/portfolio/<id>): what they needed, what we built, where it is now,
   with a few of its pages and the rest a click away. Content is the `caseStudy` in portfolio.js. */
export default function CaseStudy() {
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const index = PORTFOLIO.findIndex((x) => x.id === id && x.caseStudy);
  if (index < 0) return <NotFound />;
  const p = PORTFOLIO[index];
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
  const host = p.liveUrl ? p.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : null;

  return (
    <>
      <Seo title={p.title + ' case study — PixelFold'} description={cs.summary} path={'/portfolio/' + p.id} />
      <PageHero label="Case study" title={cs.title} accent={cs.accent} sub={cs.summary} badges={[p.industry, cs.pages, p.typeLabel]} art="sites" tab="Case study" />

      <section className="cs-body">
        <div className="container cs-grid">
          <div className="cs-text">
            <h2>What they needed</h2>
            <p>{cs.need}</p>
            <h2>What we built</h2>
            <ul className="cs-built">
              {cs.built.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <h2>The result</h2>
            <p>{cs.result}</p>
            <div className="cs-actions">
              {p.liveUrl && (
                <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <ExternalLinkIcon /> Visit {host}
                </a>
              )}
              {p.slides && (
                <button type="button" className="btn btn-outline" onClick={() => setOpen(true)}>
                  <PagesIcon /> See every page
                </button>
              )}
            </div>
          </div>
          <div className="cs-shots">
            {shots.map((s, i) => (
              <figure key={s.key} className="cs-shot pf-browser">
                <div className="pf-browser-bar">
                  <span className="pf-browser-dots"><i /><i /><i /></span>
                  <span className="pf-browser-url">{host}</span>
                </div>
                <img
                  src={s.src}
                  srcSet={s.srcSet}
                  sizes={s.srcSet ? '(max-width: 860px) calc(100vw - 40px), 560px' : undefined}
                  width="1000"
                  height="625"
                  alt={p.title + (s.label ? ' — ' + s.label + ' page' : ' page ' + (i + 1))}
                  loading={i ? 'lazy' : 'eager'}
                />
                {s.label && <figcaption>{s.label}</figcaption>}
              </figure>
            ))}
          </div>
        </div>
      </section>

      <Testimonials only={p.id} label={'What ' + p.title + ' say'} />

      <section className="cs-next">
        <div className="container cs-next-inner">
          <div>
            <p className="section-label">Want something like this?</p>
            <h2>Tell us about your project.</h2>
            <p>We come back within 24 hours with a clear scope, timeline and quote.</p>
            <Link to="/register" className="btn btn-primary">
              Book a free consultation <ArrowRightIcon />
            </Link>
          </div>
          {next && next !== p && (
            <Link to={'/portfolio/' + next.id} className="cs-next-link">
              <span className="section-label">Next case study</span>
              <strong>{next.title}</strong>
              <span>{next.caseStudy.summary}</span>
            </Link>
          )}
        </div>
      </section>

      <PortfolioModal project={open ? p : null} onClose={() => setOpen(false)} />
    </>
  );
}
