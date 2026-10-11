import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderIcon } from './BrandIcons.jsx';

/* Home page "Two ways to work with us" cards (one-off vs monthly). */
function FeatCard({ id, variant, active, inactive, onPick, tabLabel, kind, tag, title, desc, points, extraLabel, extraPoints, popular }) {
  const cls =
    'feat-card feat-card--' + variant + (active ? ' feat-active' : '') + (inactive ? ' feat-inactive' : '');
  const toggleRef = useRef(null);
  const extraId = id + '-extra';
  /* The whole card still toggles on click; the title and side tab are real
     buttons so keyboard and screen-reader users can open it too. Their clicks
     bubble up to the card's onClick. */
  return (
    <div className={cls} id={id} onClick={() => onPick(id)}>
      {popular ? (
        <div className="feat-pop-strip">⭐ Most popular</div>
      ) : (
        <div className="feat-pop-strip" style={{ visibility: 'hidden' }} aria-hidden="true">placeholder</div>
      )}
      <button
        type="button"
        className="feat-tab"
        aria-label={title}
        aria-expanded={false}
        aria-controls={extraId}
        onClick={() => requestAnimationFrame(() => toggleRef.current && toggleRef.current.focus())}
      >
        {popular && <span className="feat-pop-side">⭐ Most popular</span>}
        <span className={'feat-tab-icon feat-icon--' + variant}><FolderIcon kind={kind} size={28} /></span>
        <span className="feat-tab-label">{tabLabel}</span>
        <span className="feat-tab-arr" aria-hidden="true">↑</span>
      </button>
      <div className="feat-full">
        <div className={'feat-icon-wrap feat-icon--' + variant}><FolderIcon kind={kind} size={44} /></div>
        <span className={'feat-tag feat-tag--' + variant}>{tag}</span>
        <h3 className="feat-title">
          <button type="button" ref={toggleRef} className="feat-toggle" aria-expanded={!!active} aria-controls={extraId}>
            {title}
          </button>
        </h3>
        <p className="feat-desc">{desc}</p>
        <ul className="feat-pts">
          {points.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <div className="feat-click-prompt" aria-hidden="true"><span className="feat-prompt-icon">↓</span> Click to find out more</div>
        <div className="feat-extra" id={extraId} inert={!active}>
          <div className="feat-extra-inner">
            <p className="feat-extra-label">{extraLabel}</p>
            <ul className="feat-extra-pts">
              {extraPoints.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <Link to="/register" className={'btn feat-cta feat-cta--' + variant} onClick={(e) => e.stopPropagation()}>
              Book a consultation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  const [picked, setPicked] = useState(null);
  const pick = (id) => setPicked((cur) => (cur === id ? null : id));
  const state = (id) => ({ active: picked === id, inactive: picked !== null && picked !== id });

  return (
    <section className="features" id="pricing">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Pricing</p>
          <h2 className="section-title">
            Two ways to work with us.<br /><em>Own it outright, or let us keep it tidy.</em>
          </h2>
          <p className="section-sub">We build your site either way — the difference is who looks after it afterwards. Both are quoted per project after a free consultation.</p>
        </div>
        <div className="features-cards" id="featuresCards">
          <FeatCard
            id="fc1"
            variant="default"
            {...state('fc1')}
            onPick={pick}
            tabLabel="One-off"
            kind="key"
            tag="Build only"
            title="One-off payment"
            desc="We build your website and hand it over completely. You own it outright — no strings attached."
            points={['Full design and build', 'One round of revisions', 'Full ownership — yours to keep', 'Domain and hosting guidance']}
            extraLabel="After launch you get"
            extraPoints={[
              'Full source code and all project files',
              'A handover call to walk you through everything',
              'Step-by-step hosting setup instructions',
              'Best for businesses with someone to manage updates',
            ]}
          />
          <FeatCard
            id="fc2"
            variant="featured"
            popular
            {...state('fc2')}
            onPick={pick}
            tabLabel="Monthly"
            kind="cloud"
            tag="Managed for you"
            title="Monthly plan"
            desc="We build your site and handle everything ongoing — no technical headaches, ever."
            points={['Everything in the one-off plan', 'Hosting and security managed', 'Ongoing changes and updates', 'Priority support whenever you need it']}
            extraLabel="Every month we handle"
            extraPoints={[
              'Hosting on our fast, secure servers with SSL',
              'Content updates — text, images, new pages',
              'Security monitoring and automatic backups',
              "Priority email and phone support — we're on it",
            ]}
          />
        </div>
        <div className="features-footer-cta">
          <Link to="/services" className="btn btn-outline">See all packages</Link>
        </div>
      </div>
    </section>
  );
}
