import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { ArrowRightIcon } from '../components/Icons.jsx';
import { FolderIcon } from '../components/BrandIcons.jsx';
import CompareInline from '../components/CompareInline.jsx';
import { FAQS } from '../data/faqs.jsx';
import { R2 } from '../lib/site.js';
import PageHero from '../components/PageHero.jsx';

/* Keep the six questions people actually ask before booking. */
const FAQ_KEEP = [
  'How long does it take to build a website?',
  'How much does a website cost?',
  'What do I need to get started?',
  "Do I own the website when it's done?",
  'Do you handle hosting and the domain?',
  "What if I want changes after it's built?",
];
const FAQ_SHORT = FAQS.filter((f) => FAQ_KEEP.includes(f.q));

/* the banner's cards: one per step */
const STEP_LABELS = ['Design', 'Build', 'Launch'];

const STEPS = [
  {
    num: '01',
    label: 'Design',
    title: 'We get to know you first.',
    body: 'Before anything gets built we talk through your business, what you like, and where you’re starting from. That conversation is the brief.',
    visual: 'photo',
    img: R2 + '/images/communication-card.jpg',
    caption: 'Every project starts with a conversation, not a form.',
  },
  {
    num: '02',
    label: 'Build',
    title: 'Then we build it properly.',
    body: 'Clean, fast and mobile-first, tested on real devices until it’s right. You see progress as it happens, not a big reveal at the end.',
    visual: 'compare',
  },
  {
    num: '03',
    label: 'Launch',
    title: 'And hand it over, explained.',
    body: 'When it’s signed off we put it live and walk you through the parts people usually get left in the dark about.',
    visual: 'pillars',
    pillars: [
      { kind: 'search', title: 'Domain', text: 'Your web address, and how to manage it yourself.' },
      { kind: 'key', title: 'Security', text: 'SSL and HTTPS set up, explained in plain English.' },
      { kind: 'cloud', title: 'Hosting', text: 'Where the site lives, whether you run it or we do.' },
    ],
  },
];

/* Reveal each step block once it scrolls into view. */
function useStepReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const blocks = Array.from(root.querySelectorAll('.hiw-step'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    blocks.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, [rootRef]);
}

function Faq() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className="hiw-faq-list">
      {FAQ_SHORT.map((f, i) => (
        <div className={'faq-item' + (openIdx === i ? ' open' : '')} key={f.q}>
          <button className="faq-q" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
            {f.q}<span className="faq-icon">+</span>
          </button>
          <div className="faq-a">
            {f.render ? (
              f.render()
            ) : (
              <p>
                {f.a}
                {f.link && <Link to={f.link.to} className="faq-inline-link">{f.link.label}</Link>}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StepVisual({ step }) {
  if (step.visual === 'photo') {
    return (
      <figure className="hiw-photo pf-folder">
        <img src={step.img} alt="" loading="lazy" />
        <figcaption>{step.caption}</figcaption>
      </figure>
    );
  }
  if (step.visual === 'compare') {
    return (
      <CompareInline
        before={R2 + '/screenshots/Raza/FullWebsiteScreenieRaza-old/razaacademy.co.uk_.jpg'}
        after={R2 + '/screenshots/Raza/FullWebsiteScreenieRaza-new/razaacademy.co.uk_new.jpg'}
        label="Raza Academy home page"
        caption="Raza Academy, before and after. Drag the handle."
      />
    );
  }
  return (
    <div className="hiw-pillar-row">
      {step.pillars.map((p) => (
        <div className="hiw-pillar-mini" key={p.title}>
          <FolderIcon kind={p.kind} size={40} />
          <div>
            <strong>{p.title}</strong>
            <span>{p.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HowItWorks() {
  const pageRef = useRef(null);
  useStepReveal(pageRef);

  return (
    <div ref={pageRef}>
      <Seo
        title="How It Works — PixelFold"
        description="Getting a website with PixelFold is refreshingly simple: a conversation, a build you can watch take shape, and a handover that's explained properly."
        path="/how-it-works"
      />

      <PageHero
        label="How it works"
        title="Three steps."
        accent="No jargon."
        sub="A conversation, a build you can watch take shape, and a handover that’s actually explained."
        art="steps"
        artLabels={STEP_LABELS}
        tab="How it works"
      >
        <Link to="/register" className="btn btn-primary">
          Book a free consultation
          <ArrowRightIcon />
        </Link>
      </PageHero>

      {/* STEPS */}
      <section className="hiw-steps-section">
        <div className="container">
          {STEPS.map((s, i) => (
            <article className={'hiw-step' + (i % 2 ? ' hiw-step--flip' : '')} key={s.num}>
              <div className="hiw-step-copy">
                <span className="hiw-step-index" data-num={s.num} aria-hidden="true" />
                <p className="section-label">{s.label}</p>
                <h2 className="section-title hiw-step-heading">{s.title}</h2>
                <p className="hiw-step-body">{s.body}</p>
              </div>
              <div className="hiw-step-visual">
                <StepVisual step={s} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* TWO STARTING POINTS */}
      <section className="hiw-starts">
        <div className="container">
          <div className="hiw-starts-grid">
            <div className="hiw-start">
              <p className="section-label">Already have a site?</p>
              <h3>We’ll tell you honestly whether to fix it or start over.</h3>
              <p>Bring the link. We’ll look at what’s working, what isn’t, and give you a straight answer before any work begins.</p>
            </div>
            <div className="hiw-start">
              <p className="section-label">Starting from scratch?</p>
              <h3>Easier than you think.</h3>
              <p>A logo if you have one, a couple of sites you like the look of, and a few sentences about what you do. That’s enough to begin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="hiw-faq-section" id="faq">
        <div className="container">
          <div className="hiw-faq-header">
            <p className="section-label">Good to know</p>
            <h2 className="section-title hiw-faq-title">
              Questions people ask <em>before booking.</em>
            </h2>
          </div>
          <Faq />
          <div className="hiw-faq-cta">
            <p>Something we haven’t covered?</p>
            <Link to="/contact" className="btn btn-primary">Ask us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
