/* Previous home page (hero reel + step cards), kept only as a rollback
   while the 3D story home is new. Not routed — safe to delete. */
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import HeroReel from '../components/HeroReel.jsx';
import ReelPopup from '../components/ReelPopup.jsx';
import StepCard from '../components/StepCard.jsx';
import Mascot from '../components/Mascot.jsx';
import { FolderIcon, PixelSquares } from '../components/BrandIcons.jsx';
import useRevealOnScroll, { useFadeIn } from '../hooks/useRevealOnScroll.js';
import { PREFERS_REDUCED_MOTION, R2 } from '../lib/site.js';

/* Hero headline, one span per word so they can pop in one after another. */
const HERO_WORDS = [
  { w: 'Little' },
  { w: 'files.' },
  { w: 'Big', accent: true },
  { w: 'ideas.', accent: true },
];

const HIW_CARDS = [
  { kind: 'chat', img: R2 + '/images/communication-card.jpg', tag: 'we listen first', num: '01', title: 'Consultation', desc: 'We start by understanding your business and goals — no jargon, just a clear plan.' },
  { kind: 'pen', img: R2 + '/images/web-design-card.jpg', tag: 'small details matter', num: '02', title: 'Design', desc: 'We craft a clean, modern design around your brand — template, inspiration, or fully custom.' },
  { kind: 'code', img: R2 + '/images/Web-developerment-card.jpg', tag: "it's your creation", num: '03', title: 'Build', desc: 'We build it fast and fully responsive, tested on every device until it’s exactly right.' },
  { kind: 'rocket', img: R2 + '/images/live-card.jpg', tag: 'ready for the world', num: '04', title: 'Launch', desc: 'Once approved we go live — domain, hosting, the lot. Your site is out in the world.' },
];

const ABOUT_WORDS = ['To', 'Create,', 'We', 'Must', 'Understand.'];

const PRINCIPLES = [
  { num: '01', title: 'We listen first', desc: 'Every project starts with a conversation, not a quote. We need to understand you before we can represent you.' },
  { num: '02', title: 'We keep it simple', desc: 'No jargon, no upselling, no confusion. Honest advice and clean work, delivered on time.' },
  { num: '03', title: 'We stay involved', desc: 'One point of contact from brief to launch. You always know where things stand.' },
];

const WHY_US = [
  { kind: 'clock', title: 'Fast turnaround', desc: 'Most websites are ready in 1–2 weeks. No lengthy delays, no waiting months to go live.' },
  { kind: 'phone', title: 'Mobile-friendly', desc: 'Every site we build looks great on phones, tablets, and desktops. Your customers browse on mobile — we make sure you look good.' },
  { kind: 'coin', title: 'Honest pricing', desc: 'Every project is scoped and quoted individually, and agreed before we start. No surprise invoices, no hidden extras.' },
  { kind: 'search', title: 'Basic SEO included', desc: 'Every site comes with basic SEO setup so Google can find you. We also help with domain, hosting, and Google Business if you need it.' },
];

/* ───────────────────────── Hero ───────────────────────── */
function Hero() {
  const [revealed, setRevealed] = useState(false);
  const [popupCard, setPopupCard] = useState(null);
  const [shift, setShift] = useState(0);
  const btnRef = useRef(null);
  const stageRef = useRef(null);

  /* Un-blur the live site, fade the headline out, and slide the button down
     to sit just above the carousel — then reverse when toggled off. */
  const toggleReveal = () => {
    const next = !revealed;
    setRevealed(next);
    const btn = btnRef.current;
    const stage = stageRef.current;
    if (btn && stage) {
      const btnRect = btn.getBoundingClientRect();
      const naturalTop = btnRect.top - shift;
      if (next) {
        const gap = 20;
        const stageTop = stage.getBoundingClientRect().top;
        setShift(stageTop - btnRect.height - gap - naturalTop);
      } else {
        setShift(0);
      }
    }
  };

  const onSelect = useCallback((card) => setPopupCard(card), []);
  const closePopup = useCallback(() => setPopupCard(null), []);

  return (
    <>
      <section className={'hero' + (revealed ? ' hero-revealed' : '')} id="home">
        <div className="hero-bg" />
        <HeroReel revealed={revealed} onSelect={onSelect} stageRef={stageRef} />

        <div className="hero-text-scrim" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-content-inner">
            <Mascot variant="hero" size={74} />
            <h1 className="hero-title pop-words">
              {HERO_WORDS.map((x, i) => (
                <Fragment key={x.w}>
                  {i > 0 && ' '}
                  <span className={'pop-word' + (x.accent ? ' pop-accent' : '')} style={{ '--i': i }}>{x.w}</span>
                </Fragment>
              ))}
            </h1>
            <div className="hero-tagline-wrap visible">
              <span className="hero-underline" aria-hidden="true" />
              <p className="hero-tagline">Your ideas, well folded.</p>
              <p className="hero-sub">Fast, well-built websites for small businesses. Every card below is one we made.</p>
            </div>
          </div>
          <button
            className="hero-reveal-btn"
            id="heroRevealBtn"
            type="button"
            aria-pressed={revealed ? 'true' : 'false'}
            ref={btnRef}
            style={{ '--reveal-shift': shift + 'px' }}
            onClick={toggleReveal}
          >
            <span className="hero-reveal-icon" aria-hidden="true">{revealed ? '✕' : '👁'}</span>
            <span className="hero-reveal-label">{revealed ? 'Blur it again' : 'Peek at the real thing'}</span>
          </button>
        </div>

        <a href="#how-it-works" className="hero-scroll" aria-label="Scroll down">
          <span>Scroll</span>
          <div className="scroll-line" />
        </a>
      </section>

      <ReelPopup card={popupCard} onClose={closePopup} />
    </>
  );
}

/* ───────────────────────── About ───────────────────────── */
function About() {
  const headingRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [bodyVisible, setBodyVisible] = useState(false);

  /* Drifting light motes — random positions fixed for the component's life. */
  const motes = useMemo(() => {
    if (PREFERS_REDUCED_MOTION) return [];
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      '--x': (Math.random() * 100).toFixed(1) + '%',
      '--y': (20 + Math.random() * 70).toFixed(1) + '%',
      '--size': (3 + Math.random() * 5).toFixed(1) + 'px',
      '--rise': (60 + Math.random() * 120).toFixed(0) + 'px',
      '--dur': (10 + Math.random() * 12).toFixed(1) + 's',
      '--delay': (-Math.random() * 20).toFixed(1) + 's',
    }));
  }, []);

  /* Word-by-word blur reveal, then show the rest of the section. */
  useEffect(() => {
    const el = headingRef.current;
    if (!el) return undefined;
    if (PREFERS_REDUCED_MOTION) {
      setInView(true);
      setBodyVisible(true);
      return undefined;
    }
    let timer = null;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            io.disconnect();
            setInView(true);
            timer = setTimeout(() => setBodyVisible(true), ABOUT_WORDS.length * 90 + 650);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="about" id="about">
      <div className="about-atmosphere" aria-hidden="true">
        <span className="about-aurora about-aurora--a" />
        <span className="about-aurora about-aurora--b" />
        <span className="about-aurora about-aurora--c" />
        {motes.map(({ id, ...vars }) => (
          <span key={id} className="about-mote" style={vars} />
        ))}
      </div>
      <div className="container">
        <div className="about-tw-stage">
          <p className="section-label">About us</p>
          <h2 className={'section-title about-title about-word-reveal' + (inView ? ' in-view' : '')} ref={headingRef}>
            {ABOUT_WORDS.map((w, i) => (
              <Fragment key={w}>
                {i > 0 && ' '}
                <span className="word" style={{ transitionDelay: i * 90 + 'ms' }}>{w}</span>
              </Fragment>
            ))}
          </h2>
        </div>

        <div className={'about-body-content' + (bodyVisible ? ' visible' : '')} data-tw-reveal="">
          <div className="about-grid">
            <div className="about-text">
              <p className="about-subtitle">Who we are</p>
              <p className="about-body">
                Good websites don&rsquo;t start with design &mdash; they start with questions. What do your customers need to see? What makes your business stand out? What does success look like six months after launch? We ask those questions first. Then we build.
              </p>
            </div>
            <div className="about-principles">
              {PRINCIPLES.map((p) => (
                <div className="about-principle" key={p.num}>
                  <span className="about-principle-num">{p.num}</span>
                  <div>
                    <h4 className="about-principle-title">{p.title}</h4>
                    <p className="about-principle-desc">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Pricing ───────────────────────── */
function FeatCard({ id, variant, active, inactive, onPick, tabLabel, kind, tag, title, desc, points, extraLabel, extraPoints, popular }) {
  const cls =
    'feat-card feat-card--' + variant + (active ? ' feat-active' : '') + (inactive ? ' feat-inactive' : '');
  return (
    <div className={cls} id={id} onClick={() => onPick(id)}>
      {popular ? (
        <div className="feat-pop-strip">⭐ Most popular</div>
      ) : (
        <div className="feat-pop-strip" style={{ visibility: 'hidden' }} aria-hidden="true">placeholder</div>
      )}
      <div className="feat-tab">
        {popular && <span className="feat-pop-side">⭐ Most popular</span>}
        <div className={'feat-tab-icon feat-icon--' + variant}><FolderIcon kind={kind} size={28} /></div>
        <span className="feat-tab-label">{tabLabel}</span>
        <span className="feat-tab-arr">↑</span>
      </div>
      <div className="feat-full">
        <div className={'feat-icon-wrap feat-icon--' + variant}><FolderIcon kind={kind} size={44} /></div>
        <span className={'feat-tag feat-tag--' + variant}>{tag}</span>
        <h3 className="feat-title">{title}</h3>
        <p className="feat-desc">{desc}</p>
        <ul className="feat-pts">
          {points.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <div className="feat-click-prompt"><span className="feat-prompt-icon">↓</span> Click to find out more</div>
        <div className="feat-extra">
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

function Pricing() {
  const [picked, setPicked] = useState(null);
  const pick = (id) => setPicked((cur) => (cur === id ? null : id));
  const state = (id) => ({ active: picked === id, inactive: picked !== null && picked !== id });

  return (
    <section className="features">
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

/* ───────────────────────── Page ───────────────────────── */
export default function HomeClassic() {
  const pageRef = useRef(null);
  useFadeIn(pageRef);
  useRevealOnScroll(pageRef, '.hiw-header', { addClass: 'hiw-header--visible', threshold: 0.25 });
  useRevealOnScroll(pageRef, '.hiw-step-card', { addClass: 'hiw-visible', threshold: 0.12 });

  return (
    <div ref={pageRef}>
      <Seo
        title="PixelFold — Little files, big ideas. Websites for small businesses"
        description="PixelFold builds fast, friendly websites for small businesses. Fixed prices, quick delivery, and a team that actually picks up the phone."
        path="/"
      />

      <Hero />

      {/* HOW IT WORKS */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="hiw-header">
            <p className="section-label hiw-label">How it works</p>
            <h1 className="hiw-title">We design it. We build it. <em>You enjoy it.</em></h1>
            <p className="hiw-subtitle">
              From the first conversation to the day your site goes live, every step is handled by us &mdash; clean design, solid build, no jargon. Here&rsquo;s the process.
            </p>
          </div>
          <div className="hiw-steps">
            {HIW_CARDS.map((c) => <StepCard key={c.num} {...c} />)}
          </div>
          <div className="hiw-cta">
            <Link to="/register" className="btn hiw-btn">Book a consultation</Link>
            <Link to="/how-it-works" className="btn btn-outline hiw-btn-secondary">See the full process</Link>
          </div>
        </div>
      </section>

      <About />
      <Pricing />

      {/* WHY PIXELFOLD */}
      <section className="how-it-works" id="why-us">
        <div className="container">
          <div className="hiw-header">
            <p className="section-label hiw-label">Why PixelFold?</p>
            <h2 className="hiw-title">
              Everything a small business needs<br /><em>to get online properly.</em>
            </h2>
            <p className="hiw-subtitle">We keep things simple, honest, and affordable — so you can focus on running your business.</p>
          </div>
          <div className="hiw-steps">
            {WHY_US.map((w) => (
              <div className="hiw-step-card pf-folder" key={w.title}>
                <div className="hiw-icon-box" aria-hidden="true"><FolderIcon kind={w.kind} size={46} /></div>
                <h3 className="hiw-card-title">{w.title}</h3>
                <p className="hiw-card-desc">{w.desc}</p>
              </div>
            ))}
          </div>
          <div className="pf-divider" aria-hidden="true"><PixelSquares size={20} /></div>
          <div className="hiw-cta">
            <Link to="/register" className="btn hiw-btn">Start your website</Link>
            <Link to="/contact" className="btn btn-outline hiw-btn-secondary">Contact PixelFold</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
