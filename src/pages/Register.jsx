import { useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import { CheckIcon } from '../components/Icons.jsx';
import { useFadeIn } from '../hooks/useRevealOnScroll.js';
import { CONTACT, EMAILJS } from '../lib/site.js';
import Mascot from '../components/Mascot.jsx';
import NextSteps from '../components/NextSteps.jsx';

const TIERS = {
  Starter: {
    id: 'pkg_starter_tier',
    label: 'Which Starter package?',
    placeholder: 'Select a package…',
    options: [
      ['Starter — One-Off Build', 'One-Off Build (you host it)'],
      ['Starter — We Manage', 'We Manage (hosting included)'],
      ['Starter+ — Priority', 'Starter+ Priority (fast changes)'],
      ['Starter+++ — Backend', 'Starter+++ Backend (login features)'],
    ],
  },
  Business: {
    id: 'pkg_business_tier',
    label: 'Which Business package?',
    placeholder: 'Select a package…',
    options: [
      ['Business — One-Off Build', 'One-Off Build (you host it)'],
      ['Business — We Manage', 'We Manage (hosting included)'],
      ['Business+ — Priority', 'Business+ Priority (fast changes)'],
      ['Business+++ — Backend', 'Business+++ Backend (login features)'],
    ],
  },
  Custom: {
    id: 'pkg_custom_tier',
    label: 'What do you need?',
    placeholder: 'Select an option…',
    options: [
      ['Custom — Help With Existing Site', 'Help with my existing site (fixes, improvements, support)'],
      ['Custom — Fully Custom Build', 'Fully custom website build'],
    ],
  },
};

function SectionHead({ num, title }) {
  return (
    <div className="form-section-head">
      <div className="form-section-num">{num}</div>
      <span className="form-section-title">{title}</span>
      <div className="form-section-line" />
    </div>
  );
}

function Assurance() {
  return (
    <div className="form-assurance">
      {['100% free', 'Reply within 24 hrs', 'No commitment'].map((t) => (
        <span key={t}><CheckIcon className="fa-check" fill="#22c55e" />{t}</span>
      ))}
    </div>
  );
}

function FloatField({ id, name, label, type = 'text', required, full, area }) {
  const cls = 'form-field float-field' + (full ? ' form-field-full' : '') + (area ? ' float-field--area' : '');
  return (
    <div className={cls}>
      {area ? (
        <textarea id={id} name={name} rows="4" placeholder=" " required={required} />
      ) : (
        <input type={type} id={id} name={name} placeholder=" " required={required} />
      )}
      <label htmlFor={id}>
        {label} {required && <span className="field-req">*</span>}
      </label>
    </div>
  );
}

/* Shared submit handler: highlights empty required fields, then sends the
   brief through EmailJS and swaps the form for the success panel. */
function useBriefSubmit(intent, buildParams) {
  const [status, setStatus] = useState('idle'); /* idle | sending | sent */

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    let valid = true;
    form.querySelectorAll('[required]').forEach((field) => {
      if (field.disabled) return;
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = '#ef4444';
        field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
      }
    });
    if (!valid) return;

    setStatus('sending');
    const fd = new FormData(form);
    const params = {
      intent: intent === 'new' ? 'New Website' : 'Existing Website',
      full_name: fd.get('full_name') || '',
      business_name: fd.get('business_name') || '',
      reply_to: fd.get('email') || '',
      phone: fd.get('phone') || '',
      description: fd.get('description') || '',
      time: new Date().toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' }),
      pkg_category: '',
      pkg_tier: '',
      industry: '',
      timeline: '',
      website_url: '',
      platform: '',
      help_type: '',
      ...buildParams(fd),
    };
    try {
      await emailjs.send(EMAILJS.service, EMAILJS.quoteTemplate, params, { publicKey: EMAILJS.publicKey });
      setStatus('sent');
    } catch (err) {
      console.error('EmailJS error:', err);
      setStatus('idle');
      alert('Something went wrong — please try again or email us directly at ' + CONTACT.email);
    }
  };

  return { status, onSubmit };
}

function SuccessPanel({ id, title, text }) {
  return (
    <div className="register-success" id={id} style={{ display: 'flex' }}>
      <Mascot variant="success" size={110} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

/* ── New website brief ── */
function NewWebsiteForm() {
  const [category, setCategory] = useState('');
  const [unsure, setUnsure] = useState(false);
  const tierRef = useRef(null);

  const { status, onSubmit } = useBriefSubmit('new', (fd) => ({
    pkg_category: category || (unsure ? 'Not sure yet' : ''),
    pkg_tier: category ? fd.get('pkg_tier') || '' : '',
    industry: fd.get('industry') || '',
    timeline: fd.get('timeline') || '',
  }));

  /* Reset the tier choice whenever the category changes. */
  useEffect(() => {
    if (tierRef.current) tierRef.current.value = '';
  }, [category]);

  if (status === 'sent') {
    return <SuccessPanel id="successNew" title="Brief received!" text="We'll review your project and come back within 24 hours with next steps and a quote." />;
  }

  return (
    <form id="formNewInner" noValidate onSubmit={onSubmit}>
      <SectionHead num="1" title="Your details" />
      <div className="form-grid">
        <FloatField id="new_name" name="full_name" label="Full Name" required />
        <FloatField id="new_biz" name="business_name" label="Business / Company Name" />
        <FloatField id="new_email" name="email" type="email" label="Email Address" required />
        <FloatField id="new_phone" name="phone" type="tel" label="Phone Number" />
      </div>

      <SectionHead num="2" title="Package" />
      <div className="form-grid">
        <div className="form-field form-field-full">
          <p className="pkg-section-label">Choose a package type <span className="field-req">*</span></p>
          <div className="pkg-category-cards">
            <label className="pkg-cat-card">
              <input type="radio" name="pkg_category" value="Starter" id="pkg_starter" checked={category === 'Starter'} onChange={() => setCategory('Starter')} />
              <span className="pkg-cat-label">
                <div className="pkg-ico pkg-ico-starter"><div className="d" /></div>
                <span className="pkg-cat-name">Starter</span>
                <span className="pkg-cat-hint">1-page site</span>
              </span>
            </label>
            <label className="pkg-cat-card">
              <input type="radio" name="pkg_category" value="Business" id="pkg_business" checked={category === 'Business'} onChange={() => setCategory('Business')} />
              <span className="pkg-cat-label">
                <div className="pkg-ico pkg-ico-business"><div className="b-ring" /><div className="b-d" /></div>
                <span className="pkg-cat-name">Business</span>
                <span className="pkg-cat-hint">3&ndash;6 pages</span>
              </span>
            </label>
            <label className="pkg-cat-card">
              <input type="radio" name="pkg_category" value="Custom" id="pkg_custom" checked={category === 'Custom'} onChange={() => setCategory('Custom')} />
              <span className="pkg-cat-label">
                <div className="pkg-ico pkg-ico-custom"><div className="c-ring" /><div className="c-ring c-ring-2" /><div className="c-d" /><div className="c-dot" /></div>
                <span className="pkg-cat-name">Custom</span>
                <span className="pkg-cat-hint">Tailored build</span>
              </span>
            </label>
          </div>

          <label className="pkg-unsure-check">
            <input type="checkbox" id="pkg_unsure" name="pkg_unsure" checked={unsure} onChange={(e) => setUnsure(e.target.checked)} />
            <span className="pkg-unsure-box" />
            <span className="pkg-unsure-label">I'm not sure what I want yet — just get in touch</span>
          </label>

          {/* Tier selectors — one per category, shown for the active one */}
          {Object.entries(TIERS).map(([cat, t]) => {
            const active = category === cat;
            return (
              <div key={cat} className={'pkg-tier-wrap' + (active ? ' active' : '') + (unsure ? ' tier-disabled' : '')} id={'tier_' + cat.toLowerCase()}>
                <label htmlFor={t.id}>{t.label} <span className="field-req">*</span></label>
                <select name={active ? 'pkg_tier' : undefined} id={t.id} defaultValue="" required={active && !unsure} ref={active ? tierRef : undefined} disabled={!active}>
                  <option value="" disabled>{t.placeholder}</option>
                  {t.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      <SectionHead num="3" title="Project info" />
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="new_timeline">Desired Timeline</label>
          <select name="timeline" id="new_timeline" defaultValue="">
            <option value="" disabled>Select…</option>
            <option value="ASAP (1–2 weeks)">ASAP (1–2 weeks)</option>
            <option value="Within 1 month">Within 1 month</option>
            <option value="2–3 months">2–3 months</option>
            <option value="Flexible">Flexible</option>
          </select>
        </div>
        <FloatField id="new_industry" name="industry" label="Your Industry / Sector" />
        <FloatField id="new_desc" name="description" label="Project Description" required full area />
      </div>

      <div className="form-submit-area">
        <button type="submit" className="btn btn-primary btn-submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send my brief →'}
        </button>
        <Assurance />
      </div>
    </form>
  );
}

/* ── Existing website brief ── */
function ExistingWebsiteForm() {
  const { status, onSubmit } = useBriefSubmit('existing', (fd) => ({
    website_url: fd.get('website_url') || '',
    platform: fd.get('platform') || '',
    help_type: fd.get('help_type') || '',
  }));

  if (status === 'sent') {
    return <SuccessPanel id="successExisting" title="Got it!" text="We'll take a look and come back to you within 24 hours with next steps." />;
  }

  return (
    <form id="formExistingInner" noValidate onSubmit={onSubmit}>
      <SectionHead num="1" title="Your details" />
      <div className="form-grid">
        <FloatField id="ex_name" name="full_name" label="Full Name" required />
        <FloatField id="ex_biz" name="business_name" label="Business / Company Name" />
        <FloatField id="ex_email" name="email" type="email" label="Email Address" required />
        <FloatField id="ex_phone" name="phone" type="tel" label="Phone Number" />
      </div>

      <SectionHead num="2" title="Your website" />
      <div className="form-grid">
        <FloatField id="ex_url" name="website_url" type="url" label="Website URL" required full />
        <div className="form-field">
          <label htmlFor="ex_platform">Platform / CMS</label>
          <select id="ex_platform" name="platform" defaultValue="">
            <option value="" disabled>Select…</option>
            <option>WordPress</option>
            <option>Squarespace</option>
            <option>Wix</option>
            <option>Custom / hand-coded</option>
            <option>Not sure</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="ex_help">What do you need help with?</label>
          <select id="ex_help" name="help_type" defaultValue="">
            <option value="" disabled>Select…</option>
            <option>Bug fixes / technical issues</option>
            <option>Design refresh / redesign</option>
            <option>Speed &amp; performance</option>
            <option>Adding new pages or features</option>
            <option>Ongoing maintenance</option>
            <option>Something else</option>
          </select>
        </div>
      </div>

      <SectionHead num="3" title="Tell us more" />
      <div className="form-grid">
        <FloatField id="ex_desc" name="description" label="What's going on?" required full area />
      </div>

      <div className="form-submit-area">
        <button type="submit" className="btn btn-primary btn-submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send my brief →'}
        </button>
        <Assurance />
      </div>
    </form>
  );
}

/* Form card wrapper: replays the slide-up entrance whenever it is shown. */
function FormCard({ id, show, children, header }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return undefined;
    }
    const el = ref.current;
    if (el) {
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = 'translateY(22px)';
      void el.offsetHeight; /* force reflow so the transition restarts */
      el.style.transition = '';
      el.style.opacity = '';
      el.style.transform = '';
    }
    setVisible(true);
    return undefined;
  }, [show]);

  return (
    <div className={'register-form-card pf-folder' + (visible ? ' visible' : '')} id={id} ref={ref} style={{ display: show ? 'block' : 'none' }}>
      {header}
      <div className="form-body">{children}</div>
    </div>
  );
}

export default function Register() {
  const pageRef = useRef(null);
  const [intent, setIntent] = useState('new');
  const firstRender = useRef(true);
  useFadeIn(pageRef);

  /* Scroll the chosen form into view when the user switches (not on load). */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return undefined;
    }
    const id = setTimeout(() => {
      document.getElementById(intent === 'new' ? 'formNew' : 'formExisting')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
    return () => clearTimeout(id);
  }, [intent]);

  return (
    <div ref={pageRef}>
      <Seo
        title="Get a Free Quote — PixelFold"
        description="Get a free, no-obligation quote from PixelFold. Tell us about your project and we'll get back to you within 24 hours."
        path="/register"
      />

      <PageHero
        label="Free Quote"
        title="Tell us about"
        accent="your project."
        sub="Fill in the short brief below and we'll come back within 24 hours with a clear scope, timeline and quote. No obligation, no pressure, no jargon."
        badges={['100% free', 'Quoted per project', 'Reply within 24 hrs', 'No commitment']}
        filed
      />

      <section className="register-section">
        <div className="container">
          <div className="register-wrap">
            {/* Intent chooser */}
            <div className="intent-cards">
              <label className="intent-card">
                <input type="radio" name="intent" value="new" checked={intent === 'new'} onChange={() => setIntent('new')} />
                <div className="intent-card-label">
                  <div className="geo-wrap geo-new">
                    <div className="ring" /><div className="ring ring-2" /><div className="diamond" /><div className="orbit-dot" />
                  </div>
                  <div className="intent-text">
                    <div className="intent-card-name">New website?</div>
                    <div className="intent-card-desc">Build a brand new site from scratch</div>
                  </div>
                </div>
                <div className="intent-check">✓</div>
              </label>

              <label className="intent-card">
                <input type="radio" name="intent" value="existing" checked={intent === 'existing'} onChange={() => setIntent('existing')} />
                <div className="intent-card-label">
                  <div className="geo-wrap geo-existing">
                    <div className="hex" /><div className="hex-inner" /><div className="scan-line" />
                  </div>
                  <div className="intent-text">
                    <div className="intent-card-name">Already have a website?</div>
                    <div className="intent-card-desc">Improve or fix your existing site</div>
                  </div>
                </div>
                <div className="intent-check">✓</div>
              </label>
            </div>

            <FormCard
              id="formNew"
              show={intent === 'new'}
              header={
                <div className="form-header">
                  <div className="form-header-left">
                    <div className="form-path-label"><span className="form-path-line" />New website build</div>
                    <h2>Your project<br /><em>brief.</em></h2>
                    <p>The more you share, the sharper your quote. Takes about 2 minutes.</p>
                  </div>
                  <div className="form-header-geo">
                    <div className="fh-ring" /><div className="fh-ring fh-ring-2" /><div className="fh-dot" /><div className="fh-center" />
                  </div>
                </div>
              }
            >
              <NewWebsiteForm />
            </FormCard>

            <FormCard
              id="formExisting"
              show={intent === 'existing'}
              header={
                <div className="form-header">
                  <div className="form-header-left">
                    <div className="form-path-label"><span className="form-path-line" />Existing site support</div>
                    <h2>Tell us about<br /><em>your site.</em></h2>
                    <p>Share the details and we'll come back with next steps and a clear price.</p>
                  </div>
                  <div className="form-header-geo geo-hex">
                    <div className="fh-ring" /><div className="fh-ring fh-ring-2" /><div className="fh-dot" /><div className="fh-center" />
                  </div>
                </div>
              }
            >
              <ExistingWebsiteForm />
            </FormCard>

            <div className="register-next pf-folder">
              <NextSteps title="After you send your brief" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
