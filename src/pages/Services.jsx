import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import ServiceModal from '../components/ServiceModal.jsx';
import { useFadeIn } from '../hooks/useRevealOnScroll.js';
import { SERVICES, SERVICE_TABS } from '../data/services.js';
import { CONTACT, R2 } from '../lib/site.js';
import { FolderIcon } from '../components/BrandIcons.jsx';
import { Browser } from '../components/DeviceStack.jsx';

const FEATURE_CLASS = { bonus: 'feature-bonus', priority: 'feature-priority', backend: 'feature-backend' };

/* One representative build per tab, shown once rather than on every card. */
const EXAMPLES = {
  starter: { src: R2 + '/screenshots/ChangeWorkTherapies/changeworktherapies-banner.JPG', url: 'changeworktherapies.com', pos: 'center top', name: 'Change Work Therapies', note: 'A calm, trust-led site for a therapy practice.' },
  business: { src: R2 + '/screenshots/Raza/raza-academy-banner.JPG', url: 'razaacademy.co.uk', pos: 'center 12%', name: 'Raza Academy', note: 'An eight-page rebuild for an education provider.' },
  custom: { src: R2 + '/screenshots/TopOne/top-one-banner.JPG', url: 'topone.co.uk', pos: 'center top', name: 'Top One Salon', note: 'A bespoke multi-page build with 24 core pages.' },
};

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
  useFadeIn(pageRef);

  const modalSvc = modalKey ? SERVICES.find((s) => s.key === modalKey) : null;
  const modalService = modalSvc ? { ...modalSvc.modal, iconKind: modalSvc.iconKind } : null;
  const example = EXAMPLES[tab];
  const tabLabel = SERVICE_TABS.find((t) => t.id === tab).label.toLowerCase();

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
      />

      {/* PACKAGES */}
      <section className="menu-section" id="services">
        <div className="container">
          <div className="menu-tabs">
            {SERVICE_TABS.map((t) => (
              <button key={t.id} className={'tab-btn' + (tab === t.id ? ' active' : '')} data-tab={t.id} onClick={() => setTab(t.id)}>
                <span className="tab-folder"><FolderIcon kind={t.iconKind} size={36} /></span>
                <span className="tab-label">{t.label}</span>
                <span className="tab-sub">{t.sub}</span>
              </button>
            ))}
          </div>

          <div className="svc-layout" key={tab}>
            {/* Left: one example build + what every package includes */}
            <aside className="svc-aside">
              <div className="svc-example pf-folder">
                <Browser src={example.src} url={example.url} pos={example.pos} />
                <div className="svc-example-body">
                  <p className="section-label">Recent {tabLabel} build</p>
                  <strong>{example.name}</strong>
                  <span>{example.note}</span>
                </div>
              </div>
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
