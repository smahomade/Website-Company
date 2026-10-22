import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import ServiceModal from '../components/ServiceModal.jsx';
import { useFadeIn } from '../hooks/useRevealOnScroll.js';
import { SERVICES, SERVICE_TABS } from '../data/services.js';
import { HERO_CARDS } from '../data/heroCards.js';
import { CONTACT, PREFERS_REDUCED_MOTION } from '../lib/site.js';
import { FolderIcon } from '../components/BrandIcons.jsx';
import { PauseIcon, PlayIcon } from '../components/Icons.jsx';

const FEATURE_CLASS = { bonus: 'feature-bonus', priority: 'feature-priority', backend: 'feature-backend' };

/* Recent builds, shown beside the packages: real client sites. Business opens
   on Change Work Therapies and Custom on Top One (BUILD_FOR_TAB); none of them
   is a one-page starter, so Starter just opens on the first. The pills show the
   others, and hovering one plays its tour. */
const EXAMPLES = [
  { name: 'Raza Academy', short: 'Raza', note: 'An eight-page rebuild for an education provider.' },
  { name: 'Top One Salon', short: 'Top One', note: 'A bespoke build of 40+ pages for a London salon.' },
  { name: 'Change Work Therapies', short: 'Change Work', note: 'A seven-page site for a therapy practice, calm and trust-led.' },
].map((e) => {
  const card = HERO_CARDS.find((c) => c.name === e.name);
  return { ...e, url: card.url, still: card.tourPoster || card.img, pos: card.tourPoster ? 'center top' : card.imgPos, tour: PREFERS_REDUCED_MOTION ? null : card.tour };
});
/* the build a tab opens on (the pills still show the others) */
const BUILD_FOR_TAB = { business: 'Change Work Therapies', custom: 'Top One Salon' };
const buildFor = (tab) => Math.max(0, EXAMPLES.findIndex((e) => e.name === BUILD_FOR_TAB[tab]));
const CAN_HOVER = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* One build in a browser frame, with the others a click away. The mouse over
   the frame plays its tour (a still otherwise); the button does the same for
   touch and keyboard. */
function ExampleBuild({ index, onPick }) {
  const ex = EXAMPLES[index];
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => setPlaying(false), [index]);

  const play = () => {
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && p.catch) p.catch(() => setPlaying(false));
    setPlaying(true);
  };
  const stop = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0; /* back to the frame the still shows */
    setPlaying(false);
  };

  return (
    <div className={'svc-example pf-folder' + (ex.tour ? ' has-clip' : '') + (playing ? ' is-playing' : '')}>
      <div
        className="pf-browser"
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') play();
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') stop();
        }}
      >
        <div className="pf-browser-bar">
          <span className="pf-browser-dots"><i /><i /><i /></span>
          <span className="pf-browser-url">{ex.url}</span>
        </div>
        <img src={ex.still} alt={ex.url + ' website'} loading="lazy" style={{ objectPosition: ex.pos }} />
        {ex.tour && (
          <>
            <video key={ex.tour} ref={videoRef} src={ex.tour} muted loop playsInline preload={CAN_HOVER ? 'auto' : 'metadata'} aria-hidden="true" tabIndex={-1} />
            <button type="button" className="svc-example-play" aria-label={(playing ? 'Stop the ' : 'Play the ') + ex.name + ' preview'} onClick={playing ? stop : play}>
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
          </>
        )}
      </div>
      <div className="svc-example-body">
        <p className="section-label">Recent builds</p>
        <strong>{ex.name}</strong>
        <span>{ex.note}</span>
        <div className="svc-example-picks" role="group" aria-label="Choose a build">
          {EXAMPLES.map((e, i) => (
            <button key={e.name} type="button" className={i === index ? 'is-on' : undefined} aria-pressed={i === index} onClick={() => onPick(i)}>
              {e.short}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const INCLUDED = ['Mobile-first design', 'Basic on-page SEO', 'Contact form', 'Handover explained in plain English'];

const EXPECT = [
  { n: '1', t: 'Free consultation', d: 'A short conversation about your business and what you need.' },
  { n: '2', t: 'Quote within 24 hours', d: 'Scope, timeline and price, agreed before any work starts.' },
  { n: '3', t: 'Progress as it happens', d: 'You see the site take shape rather than waiting for a big reveal.' },
  { n: '4', t: 'Launch and handover', d: 'We put it live and walk you through domain, hosting and security.' },
];

function PackageRow({ s, index, onDetails }) {
  return (
    <div className={'svc-row pf-pop ' + s.tier} style={{ '--i': index }}>
      <div className="svc-row-head">
        <span className="svc-row-icon"><FolderIcon kind={s.iconKind} size={40} /></span>
        <div className="svc-row-titles">
          <div className="svc-row-meta">
            <span className="card-tier-label">{s.tierLabel}</span>
            {s.ribbon && <span className={'svc-row-ribbon' + (s.ribbon.own ? ' is-own' : '')}>{s.ribbon.text}</span>}
          </div>
          <h3 className="svc-row-title">{s.title}</h3>
          <p className="svc-row-tagline">{s.tagline}</p>
        </div>
      </div>
      <ul className="svc-row-features">
        {s.features.map((f) => {
          const item = typeof f === 'string' ? { text: f } : f;
          return <li key={item.text} className={FEATURE_CLASS[item.type] || undefined}>{item.text}</li>;
        })}
      </ul>
      <div className="svc-row-actions">
        <button className="read-more-btn" onClick={() => onDetails(s.key)}>Read more</button>
        <Link to="/register" className="btn btn-primary btn-sm">Book a consultation</Link>
      </div>
    </div>
  );
}

export default function Services() {
  const pageRef = useRef(null);
  const [tab, setTab] = useState('starter');
  const [modalKey, setModalKey] = useState(null);
  const [build, setBuild] = useState(() => buildFor('starter')); /* which recent build is showing */
  useFadeIn(pageRef);

  const modalSvc = modalKey ? SERVICES.find((s) => s.key === modalKey) : null;
  const modalService = modalSvc ? { ...modalSvc.modal, iconKind: modalSvc.iconKind } : null;

  return (
    <div ref={pageRef}>
      <Seo
        title="Services — PixelFold"
        description="PixelFold builds single-page, multi-page and fully custom websites for small businesses, with managed hosting and support if you want it. Each project is scoped and quoted individually."
        path="/services"
      />

      <PageHero
        label="What we offer"
        title="Our"
        accent="Services"
        sub="Websites for small businesses across the UK. Every project is scoped and quoted around what you actually need, with clear timelines and no hidden fees."
        badges={['Quoted per project', 'Mobile-first design', 'UK-based', 'Fast turnaround']}
        art="folders"
        tab="Services"
      />

      {/* PACKAGES */}
      <section className="menu-section" id="services">
        <div className="container">
          <div className="menu-tabs">
            {SERVICE_TABS.map((t) => (
              <button
                key={t.id}
                className={'tab-btn' + (tab === t.id ? ' active' : '')}
                data-tab={t.id}
                onClick={() => {
                  setTab(t.id);
                  setBuild(buildFor(t.id));
                }}
              >
                <span className="tab-folder"><FolderIcon kind={t.iconKind} size={36} /></span>
                <span className="tab-label">{t.label}</span>
                <span className="tab-sub">{t.sub}</span>
              </button>
            ))}
          </div>

          <div className="svc-layout" key={tab}>
            {/* Left: a recent build + what every package includes */}
            <aside className="svc-aside">
              <ExampleBuild index={build} onPick={setBuild} />
              <div className="svc-included">
                <p className="section-label">Every package includes</p>
                <ul>
                  {INCLUDED.map((x) => <li key={x}>{x}</li>)}
                </ul>
                <p className="svc-included-note">No fixed price list. Each package is scoped and quoted around your project, and agreed before any work starts.</p>
              </div>
            </aside>

            {/* Right: the packages in this tab */}
            <div className="svc-rows">
              {SERVICES.filter((s) => s.category === tab).map((s, i) => (
                <PackageRow key={s.key} s={s} index={i} onDetails={setModalKey} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHAT TO EXPECT */}
      <section className="svc-expect">
        <div className="container">
          <div className="section-header">
            <p className="section-label">What to expect</p>
            <h2 className="section-title">How a project runs, <em>start to finish.</em></h2>
          </div>
          <ol className="svc-expect-list">
            {EXPECT.map((e) => (
              <li key={e.n}>
                <span className="svc-expect-num">{e.n}</span>
                <strong>{e.t}</strong>
                <p>{e.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="order-section" id="cta">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Ready when you are</p>
            <h2 className="section-title" style={{ color: '#fff' }}>Tell us about your project.</h2>
          </div>
          <div className="order-grid">
            <div className="order-card order-card-featured pf-folder">
              <div className="order-popular">Recommended</div>
              <div className="order-icon"><FolderIcon kind="chat" size={44} tone="dark" /></div>
              <h3>Book a free consultation</h3>
              <p>Tell us what you need and we come back within 24 hours with a clear scope, timeline and quote. No obligation.</p>
              <Link to="/register" className="btn btn-white">Start your brief</Link>
            </div>
            <div className="order-card pf-folder">
              <div className="order-icon"><FolderIcon kind="phone" size={44} tone="dark" /></div>
              <h3>Message on WhatsApp</h3>
              <p>Prefer to talk it through? Send a message and we will arrange a quick call at a time that suits you.</p>
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light">Open WhatsApp</a>
            </div>
            <div className="order-card pf-folder">
              <div className="order-icon"><FolderIcon kind="mail" size={44} tone="dark" /></div>
              <h3>Send an email</h3>
              <p>Email your requirements and we will respond within 24 hours with next steps.</p>
              <a href={'mailto:' + CONTACT.email} className="btn btn-outline-light">Email us</a>
            </div>
          </div>
        </div>
      </section>

      <ServiceModal service={modalService} onClose={() => setModalKey(null)} />
    </div>
  );
}
