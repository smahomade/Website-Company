import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import PortfolioModal from '../components/PortfolioModal.jsx';
import { ExternalLinkIcon, PagesIcon, ScreenshotIcon } from '../components/Icons.jsx';
import { useFadeIn } from '../hooks/useRevealOnScroll.js';
import { PORTFOLIO, PORTFOLIO_FILTERS } from '../data/portfolio.js';
import { LOGO } from '../lib/site.js';
import Mascot from '../components/Mascot.jsx';
import Testimonials from '../components/Testimonials.jsx';

function matches(p, filter) {
  if (filter === 'all') return true;
  return (p.types || [p.type]).includes(filter);
}

function PortfolioCard({ p, index, onOpen }) {
  const isCompare = Array.isArray(p.slides) && typeof p.slides[0] === 'object';
  const placeholder = p.status === 'coming-soon';

  return (
    <div
      className="portfolio-card pf-folder pf-pop"
      style={{ '--i': index }}
      data-type={p.type}
      onClick={(e) => {
        if (!p.slides) return;
        if (e.target.closest('.portfolio-live-btn')) return;
        onOpen(p);
      }}
    >
      <div className={'portfolio-card-preview' + (placeholder ? ' portfolio-preview-placeholder' : '')}>
        {placeholder ? (
          <>
            <img src={LOGO.mark} className="pf-placeholder-cat" alt="" />
            <span className="portfolio-preview-label">Coming soon</span>
          </>
        ) : (
          <img src={p.preview} alt={p.title + ' website'} style={p.previewPos ? { objectPosition: p.previewPos } : undefined} />
        )}
        <div className="portfolio-card-overlay">
          <span className="portfolio-card-overlay-btn">
            {isCompare ? <PagesIcon /> : <ScreenshotIcon />} {isCompare ? 'View Pages' : 'View Screenshots'}
          </span>
        </div>
      </div>
      <div className="portfolio-card-body">
        <div className="portfolio-card-meta">
          <span className="portfolio-type-tag">{p.typeLabel}</span>
          <span className="portfolio-industry">{p.industry}</span>
        </div>
        <h3>{p.title}</h3>
        <p>{p.desc}</p>
        <div className="portfolio-card-footer">
          {p.status === 'live' && <span className="portfolio-live-badge">● Live</span>}
          {p.status === 'delivered' && <span className="portfolio-delivered-badge">● Delivered</span>}
          {placeholder && <span className="portfolio-coming-soon">Coming Soon</span>}
          {p.caseStudy && (
            <Link to={'/portfolio/' + p.id} className="portfolio-live-btn portfolio-case-btn">
              Case study
            </Link>
          )}
          {p.liveUrl && (
            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="portfolio-live-btn">
              <ExternalLinkIcon />
              View Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const pageRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [openProject, setOpenProject] = useState(null);
  useFadeIn(pageRef);

  const visible = PORTFOLIO.filter((p) => matches(p, filter));

  return (
    <div ref={pageRef}>
      <Seo
        title="Portfolio — PixelFold"
        description="Browse websites PixelFold has built for real businesses. See our work across static sites, dynamic CMS sites, e-commerce, and more."
        path="/portfolio"
      />

      <PageHero
        label="Our Work"
        title="Our"
        accent="Portfolio"
        sub="Example website builds across different industries. These show the kind of designs and quality you can expect from PixelFold."
        badges={['Custom built', 'Static/Dynamic', 'Mobile-friendly', 'UK-based team']}
        art="sites"
        tab="Portfolio"
      />

      {/* PORTFOLIO GRID */}
      <section className="portfolio-section">
        <div className="container">
          <div className="portfolio-section-header">
            <h2 className="portfolio-section-title">Browse our projects</h2>
            <p className="portfolio-section-sub">Filter by type or scroll through everything we've built.</p>
          </div>

          <div className="portfolio-filters">
            {PORTFOLIO_FILTERS.map((f) => (
              <button key={f.id} className={'portfolio-filter-btn' + (filter === f.id ? ' active' : '')} data-filter={f.id} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>

          {/* keyed on the filter so the cards replay their entrance when it changes */}
          <div className="portfolio-grid" id="portfolioGrid" key={filter}>
            {visible.map((p, i) => (
              <PortfolioCard key={p.id} p={p} index={i} onOpen={setOpenProject} />
            ))}
            {/* Open slot: invites the next project instead of showing a dummy card */}
            <div className="pf-next-card pf-pop" style={{ '--i': visible.length }}>
              <Mascot variant="inline" size={64} />
              <p className="section-label">Next up</p>
              <h3>Your website could be here.</h3>
              <p>We're taking on new projects. Tell us what you need and we'll come back within 24 hours with a plan.</p>
              <Link to="/register" className="btn btn-primary btn-sm">Start a project</Link>
            </div>
          </div>

          {/* EMPTY STATE (styled away by CSS while projects exist) */}
          <div className="portfolio-empty">
            <div className="portfolio-empty-icon">🚀</div>
            <h2>Projects on the way</h2>
            <p>We're currently building websites for our first clients. Check back soon to see our work — or be one of the first!</p>
            <Link to="/register" className="btn btn-primary">Book a consultation</Link>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* CTA STRIP */}
      <section className="portfolio-cta">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="portfolio-cta-inner">
            <div>
              <p className="portfolio-cta-label">Seen enough?</p>
              <h2>Let's build yours next.</h2>
              <p>Tell us about your project and we'll come back within 24 hours with a clear quote.</p>
            </div>
            <Link to="/register" className="btn btn-white">Book a consultation &rarr;</Link>
          </div>
        </div>
      </section>

      <PortfolioModal project={openProject} onClose={() => setOpenProject(null)} />
    </div>
  );
}
